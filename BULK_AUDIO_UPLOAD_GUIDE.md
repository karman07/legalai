# Bulk Audio Upload Guide - Fixing File Mapping Issues

## Problem Explanation

When uploading audio lessons in batches, the audio files were getting 404 errors because of incorrect index mapping between the sections array and the audio file field names.

### How the Backend Works

The backend controller processes audio files based on their **position in the sections array** being sent in the request:

```typescript
// Controller iterates through sections array
parsedDto.sections.map((section, index) => {
  // Looks for audio files with field name: section_{index}_englishAudio
  const audioFile = files.find(f => f.fieldname === `section_${index}_englishAudio`);
})
```

**Key Point:** `index` is the position in the `sections` array (0-based), NOT a cumulative count.

## The Issue with Your Python Script

Your script was doing this:

```python
# WRONG APPROACH
section_idx = total_sections_so_far + idx  # e.g., 10, 11, 12... for batch 2
field_name = f"section_{section_idx}_englishAudio"  # section_10_englishAudio

# But sending sections array with indices 0-9
all_sections = existing_sections + sections_data  # [0...9, 10...19]
```

The backend looks for `section_0_englishAudio` through `section_9_englishAudio` for the first 10 sections in the array, but your script was sending `section_10_englishAudio`, `section_11_englishAudio`, etc.

## Solution: Two Approaches

### Approach 1: Send Complete Sections Array (Recommended)

When updating, send ALL sections (existing + new) with audio files indexed by their position in the complete array.

```python
def update_with_sections(lesson_id, sections_batch, batch_num, total_sections_so_far):
    # Get existing sections
    existing_sections = get_current_sections(lesson_id)
    
    sections_data = []
    files_to_upload = {}
    
    for idx, section_dir in enumerate(sections_batch):
        section_data = build_section_data(section_dir)
        sections_data.append(section_data)
        
        # Calculate position in COMPLETE array
        array_position = len(existing_sections) + idx
        
        # Use array_position for file field names
        audio_files = [
            ("Main_Content.opus", f"section_{array_position}_englishAudio"),
            ("Main_Content_Easy.opus", f"section_{array_position}_easyEnglishAudio")
        ]
        
        for audio_file, field_name in audio_files:
            audio_path = section_dir / audio_file
            if audio_path.exists():
                files_to_upload[field_name] = (audio_file, open(audio_path, 'rb'), 'audio/ogg')
        
        # Handle subsections
        if "subsections" in section_data:
            for sub_idx, _ in enumerate(section_data["subsections"]):
                illus_id = chr(97 + sub_idx)
                sub_audio_files = [
                    (f"zz_Illustration_{illus_id}.opus", 
                     f"section_{array_position}_subsection_{sub_idx}_englishAudio"),
                    (f"zz_Illustration_{illus_id}_Easy.opus", 
                     f"section_{array_position}_subsection_{sub_idx}_easyEnglishAudio")
                ]
                
                for audio_file, field_name in sub_audio_files:
                    audio_path = section_dir / audio_file
                    if audio_path.exists():
                        files_to_upload[field_name] = (audio_file, open(audio_path, 'rb'), 'audio/ogg')
    
    # Combine existing + new sections
    all_sections = existing_sections + sections_data
    
    # Send complete array
    data = {"sections": json.dumps(all_sections)}
    
    # Upload
    response = requests.put(f"{API_URL}/{lesson_id}", headers=headers, data=data, files=files_to_upload)
```

### Approach 2: Create Separate Lessons per Batch

Create individual lessons for each batch instead of appending to one lesson.

```python
def create_lesson_with_sections(sections_batch, batch_num):
    sections_data = []
    files_to_upload = {}
    
    # Use 0-based index for THIS batch only
    for idx, section_dir in enumerate(sections_batch):
        section_data = build_section_data(section_dir)
        sections_data.append(section_data)
        
        # idx is 0-9 for each batch
        audio_files = [
            ("Main_Content.opus", f"section_{idx}_englishAudio"),
            ("Main_Content_Easy.opus", f"section_{idx}_easyEnglishAudio")
        ]
        
        for audio_file, field_name in audio_files:
            audio_path = section_dir / audio_file
            if audio_path.exists():
                files_to_upload[field_name] = (audio_file, open(audio_path, 'rb'), 'audio/ogg')
        
        # Handle subsections with idx (not cumulative)
        if "subsections" in section_data:
            for sub_idx, _ in enumerate(section_data["subsections"]):
                illus_id = chr(97 + sub_idx)
                sub_audio_files = [
                    (f"zz_Illustration_{illus_id}.opus", 
                     f"section_{idx}_subsection_{sub_idx}_englishAudio"),
                    (f"zz_Illustration_{illus_id}_Easy.opus", 
                     f"section_{idx}_subsection_{sub_idx}_easyEnglishAudio")
                ]
                
                for audio_file, field_name in sub_audio_files:
                    audio_path = section_dir / audio_file
                    if audio_path.exists():
                        files_to_upload[field_name] = (audio_file, open(audio_path, 'rb'), 'audio/ogg')
    
    # Create new lesson for this batch
    data = {
        "title": f"Indian Contract Act 1872 - Batch {batch_num}",
        "sections": json.dumps(sections_data)
    }
    
    response = requests.post(API_URL, headers=headers, data=data, files=files_to_upload)
```

## Index Mapping Rules

### ✅ Correct Mapping

```
Sections Array: [Section0, Section1, Section2]
Audio Files:
  - section_0_englishAudio → Section0
  - section_1_englishAudio → Section1
  - section_2_englishAudio → Section2
```

### ❌ Incorrect Mapping

```
Sections Array: [Section0, Section1, Section2]
Audio Files:
  - section_10_englishAudio → NOT FOUND (404)
  - section_11_englishAudio → NOT FOUND (404)
  - section_12_englishAudio → NOT FOUND (404)
```

## Complete Working Example

```python
#!/usr/bin/env python3
import json
import requests
from pathlib import Path

API_URL = "https://api.legalpadhai.ai/api/admin/audio-lessons"
JWT_TOKEN = "YOUR_JWT_TOKEN"
SECTIONS_PER_BATCH = 10

def get_current_sections(lesson_id):
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    response = requests.get(f"{API_URL}/{lesson_id}", headers=headers)
    if response.status_code == 200:
        return response.json().get('sections', [])
    return []

def build_section_data(section_dir):
    section_num = section_dir.name.split('_')[1]
    section = {
        "title": f"Section {section_num}",
        "englishText": read_file(section_dir / "Main_Content.txt"),
        "easyEnglishText": read_file(section_dir / "Main_Content_Easy.txt")
    }
    
    subsections = []
    for file in sorted(section_dir.glob("zz_Illustration_*.txt")):
        if "_Easy" not in file.name:
            illus_id = file.stem.split('_')[-1]
            subsection = {
                "title": f"Illustration {illus_id.upper()}",
                "englishText": read_file(file),
                "easyEnglishText": read_file(section_dir / f"zz_Illustration_{illus_id}_Easy.txt")
            }
            subsections.append(subsection)
    
    if subsections:
        section["subsections"] = subsections
    
    return section

def update_with_sections(lesson_id, sections_batch, batch_num):
    existing_sections = get_current_sections(lesson_id)
    existing_count = len(existing_sections)
    
    sections_data = []
    files_to_upload = {}
    
    for idx, section_dir in enumerate(sections_batch):
        section_data = build_section_data(section_dir)
        sections_data.append(section_data)
        
        # Position in complete array
        array_idx = existing_count + idx
        
        # Main section audio
        audio_files = [
            ("Main_Content.opus", f"section_{array_idx}_englishAudio"),
            ("Main_Content_Easy.opus", f"section_{array_idx}_easyEnglishAudio")
        ]
        
        for audio_file, field_name in audio_files:
            audio_path = section_dir / audio_file
            if audio_path.exists():
                files_to_upload[field_name] = (audio_file, open(audio_path, 'rb'), 'audio/ogg')
        
        # Subsection audio
        if "subsections" in section_data:
            for sub_idx, _ in enumerate(section_data["subsections"]):
                illus_id = chr(97 + sub_idx)
                sub_audio_files = [
                    (f"zz_Illustration_{illus_id}.opus", 
                     f"section_{array_idx}_subsection_{sub_idx}_englishAudio"),
                    (f"zz_Illustration_{illus_id}_Easy.opus", 
                     f"section_{array_idx}_subsection_{sub_idx}_easyEnglishAudio")
                ]
                
                for audio_file, field_name in sub_audio_files:
                    audio_path = section_dir / audio_file
                    if audio_path.exists():
                        files_to_upload[field_name] = (audio_file, open(audio_path, 'rb'), 'audio/ogg')
    
    # Combine all sections
    all_sections = existing_sections + sections_data
    
    data = {"sections": json.dumps(all_sections)}
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    
    print(f"[Batch {batch_num}] Uploading {len(sections_data)} sections (total: {len(all_sections)})")
    print(f"[Batch {batch_num}] Audio files: {len(files_to_upload)}")
    
    try:
        response = requests.put(f"{API_URL}/{lesson_id}", headers=headers, data=data, files=files_to_upload)
        
        if response.status_code in [200, 201]:
            print(f"✓ Batch {batch_num} uploaded successfully!")
            return True
        else:
            print(f"✗ Batch {batch_num} failed: {response.status_code}")
            print(response.text[:500])
            return False
    finally:
        for f in files_to_upload.values():
            if isinstance(f, tuple):
                f[1].close()

def main():
    lesson_id = "YOUR_LESSON_ID"
    sections = get_sections()  # Your function to get section directories
    
    for i in range(0, len(sections), SECTIONS_PER_BATCH):
        batch = sections[i:i + SECTIONS_PER_BATCH]
        batch_num = (i // SECTIONS_PER_BATCH) + 1
        update_with_sections(lesson_id, batch, batch_num)

if __name__ == "__main__":
    main()
```

## Key Takeaways

1. **Index = Array Position**: Audio file indices must match the position in the sections array
2. **Complete Array**: When updating, send the complete sections array (existing + new)
3. **Calculate Position**: `array_position = len(existing_sections) + current_batch_index`
4. **Consistent Naming**: Use `section_{array_position}_languageAudio` format
5. **Subsections**: Use `section_{array_position}_subsection_{sub_index}_languageAudio`

## Debugging Tips

1. Check uploaded files exist: `ls /var/www/backend/uploads/audio/`
2. Verify file naming matches database URLs
3. Check nginx serves `/uploads/audio/` correctly
4. Confirm section indices in database match file field names used during upload
