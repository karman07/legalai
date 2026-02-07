# Bulk Audio Lesson Upload Guide - POST & PUT APIs

## Overview

This guide explains how to bulk upload audio lessons with sections and subsections using the Audio Lesson API. Two methods are covered:
1. **POST API** - Create new lessons (recommended for batches)
2. **PUT API** - Update existing lessons (for appending sections)

---

## Method 1: Using POST API (Recommended)

Create separate lessons for each batch. This is simpler and avoids index mapping issues.

### Advantages
- Simple index mapping (always 0-based)
- No need to fetch existing sections
- Faster uploads (smaller payloads)
- Easy to retry failed batches

### Python Script - POST Method

```python
#!/usr/bin/env python3
import json
import requests
from pathlib import Path

API_URL = "https://api.legalpadhai.ai/api/admin/audio-lessons"
JWT_TOKEN = "YOUR_JWT_TOKEN_HERE"
SECTIONS_PER_BATCH = 10

def read_file(path):
    if path.exists():
        return path.read_text(encoding='utf-8').strip()
    return None

def get_sections():
    """Get all section directories sorted by number"""
    sections = [d for d in Path('.').iterdir() if d.is_dir() and d.name.startswith('Section_')]
    def sort_key(x):
        num = x.name.split('_')[1]
        try:
            return (int(num), '')
        except ValueError:
            return (int(''.join(c for c in num if c.isdigit())), num)
    return sorted(sections, key=sort_key)

def build_section_data(section_dir):
    """Build section data from directory"""
    section_num = section_dir.name.split('_')[1]
    section = {
        "title": f"Section {section_num}",
        "englishText": read_file(section_dir / "Main_Content.txt"),
        "easyEnglishText": read_file(section_dir / "Main_Content_Easy.txt")
    }
    
    # Build subsections from illustration files
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

def create_lesson_batch(sections_batch, batch_num, total_batches):
    """Create a new lesson with a batch of sections using POST"""
    sections_data = []
    files_to_upload = {}
    
    # Build sections data and collect audio files
    for idx, section_dir in enumerate(sections_batch):
        section_data = build_section_data(section_dir)
        sections_data.append(section_data)
        
        # Audio files for main section (idx is 0-based for THIS batch)
        audio_files = [
            ("Main_Content.opus", f"section_{idx}_englishAudio"),
            ("Main_Content_Easy.opus", f"section_{idx}_easyEnglishAudio")
        ]
        
        for audio_file, field_name in audio_files:
            audio_path = section_dir / audio_file
            if audio_path.exists():
                files_to_upload[field_name] = (audio_file, open(audio_path, 'rb'), 'audio/ogg')
        
        # Audio files for subsections
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
    
    # Prepare request data
    data = {
        "title": f"Indian Contract Act 1872 - Part {batch_num}",
        "headTitle": f"The Indian Contract Act, 1872 - Part {batch_num} of {total_batches}",
        "description": f"Audio lessons covering sections in batch {batch_num}",
        "category": "civil-law",
        "tags": json.dumps(["contract law", "indian law", "civil law"]),
        "sections": json.dumps(sections_data)
    }
    
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    
    print(f"[Batch {batch_num}] Creating lesson with {len(sections_data)} sections...")
    print(f"[Batch {batch_num}] Uploading {len(files_to_upload)} audio files...")
    
    try:
        response = requests.post(API_URL, headers=headers, data=data, files=files_to_upload)
        
        if response.status_code in [200, 201]:
            lesson_id = response.json().get('_id')
            print(f"✓ Batch {batch_num} created successfully! Lesson ID: {lesson_id}")
            return lesson_id
        else:
            print(f"✗ Batch {batch_num} failed: {response.status_code}")
            print(response.text[:500])
            return None
    except Exception as e:
        print(f"✗ Batch {batch_num} error: {e}")
        return None
    finally:
        for f in files_to_upload.values():
            if isinstance(f, tuple):
                f[1].close()

def main():
    sections = get_sections()
    total_sections = len(sections)
    total_batches = (total_sections + SECTIONS_PER_BATCH - 1) // SECTIONS_PER_BATCH
    
    print(f"Total sections: {total_sections}")
    print(f"Sections per batch: {SECTIONS_PER_BATCH}")
    print(f"Total batches: {total_batches}")
    print("=" * 60)
    
    created_lessons = []
    
    for i in range(0, total_sections, SECTIONS_PER_BATCH):
        batch = sections[i:i + SECTIONS_PER_BATCH]
        batch_num = (i // SECTIONS_PER_BATCH) + 1
        
        lesson_id = create_lesson_batch(batch, batch_num, total_batches)
        if lesson_id:
            created_lessons.append(lesson_id)
    
    print("=" * 60)
    print(f"Upload complete!")
    print(f"Created {len(created_lessons)} lessons")
    print(f"Lesson IDs: {created_lessons}")

if __name__ == "__main__":
    main()
```

---

## Method 2: Using PUT API (Append to Existing Lesson)

Update an existing lesson by appending new sections. Requires careful index management.

### Advantages
- Single lesson with all sections
- Better for maintaining continuity

### Disadvantages
- Complex index mapping
- Must fetch existing sections first
- Larger payloads (sends all sections)
- Slower for large lessons

### Python Script - PUT Method

```python
#!/usr/bin/env python3
import json
import requests
from pathlib import Path

API_URL = "https://api.legalpadhai.ai/api/admin/audio-lessons"
JWT_TOKEN = "YOUR_JWT_TOKEN_HERE"
SECTIONS_PER_BATCH = 10

def read_file(path):
    if path.exists():
        return path.read_text(encoding='utf-8').strip()
    return None

def get_sections():
    """Get all section directories sorted by number"""
    sections = [d for d in Path('.').iterdir() if d.is_dir() and d.name.startswith('Section_')]
    def sort_key(x):
        num = x.name.split('_')[1]
        try:
            return (int(num), '')
        except ValueError:
            return (int(''.join(c for c in num if c.isdigit())), num)
    return sorted(sections, key=sort_key)

def get_current_sections(lesson_id):
    """Fetch existing sections from the lesson"""
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    response = requests.get(f"{API_URL}/{lesson_id}", headers=headers)
    if response.status_code == 200:
        return response.json().get('sections', [])
    return []

def build_section_data(section_dir):
    """Build section data from directory"""
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

def append_sections_batch(lesson_id, sections_batch, batch_num):
    """Append sections to existing lesson using PUT"""
    # Get existing sections
    existing_sections = get_current_sections(lesson_id)
    existing_count = len(existing_sections)
    
    print(f"[Batch {batch_num}] Current sections in lesson: {existing_count}")
    
    sections_data = []
    files_to_upload = {}
    
    # Build new sections data
    for idx, section_dir in enumerate(sections_batch):
        section_data = build_section_data(section_dir)
        sections_data.append(section_data)
        
        # CRITICAL: Calculate position in COMPLETE array
        array_position = existing_count + idx
        
        # Audio files for main section
        audio_files = [
            ("Main_Content.opus", f"section_{array_position}_englishAudio"),
            ("Main_Content_Easy.opus", f"section_{array_position}_easyEnglishAudio")
        ]
        
        for audio_file, field_name in audio_files:
            audio_path = section_dir / audio_file
            if audio_path.exists():
                files_to_upload[field_name] = (audio_file, open(audio_path, 'rb'), 'audio/ogg')
        
        # Audio files for subsections
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
    
    data = {"sections": json.dumps(all_sections)}
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    
    print(f"[Batch {batch_num}] Adding {len(sections_data)} sections (total: {len(all_sections)})")
    print(f"[Batch {batch_num}] Uploading {len(files_to_upload)} audio files...")
    
    try:
        response = requests.put(f"{API_URL}/{lesson_id}", headers=headers, data=data, files=files_to_upload)
        
        if response.status_code in [200, 201]:
            print(f"✓ Batch {batch_num} appended successfully!")
            return True
        else:
            print(f"✗ Batch {batch_num} failed: {response.status_code}")
            print(response.text[:500])
            return False
    except Exception as e:
        print(f"✗ Batch {batch_num} error: {e}")
        return False
    finally:
        for f in files_to_upload.values():
            if isinstance(f, tuple):
                f[1].close()

def create_main_lesson():
    """Create the main lesson (empty or with metadata only)"""
    data = {
        "title": "Indian Contract Act 1872",
        "headTitle": "The Indian Contract Act, 1872",
        "description": "Complete audio lessons covering all sections",
        "category": "civil-law",
        "tags": json.dumps(["contract law", "indian law", "civil law"])
    }
    
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    
    print("Creating main lesson...")
    response = requests.post(API_URL, headers=headers, data=data)
    
    if response.status_code in [200, 201]:
        lesson_id = response.json()['_id']
        print(f"✓ Main lesson created with ID: {lesson_id}")
        return lesson_id
    else:
        print(f"✗ Failed to create lesson: {response.status_code}")
        print(response.text)
        return None

def main():
    # Step 1: Create main lesson
    lesson_id = create_main_lesson()
    if not lesson_id:
        print("Failed to create main lesson. Exiting.")
        return
    
    # Step 2: Get all sections
    sections = get_sections()
    total_sections = len(sections)
    
    print(f"\nTotal sections to add: {total_sections}")
    print(f"Sections per batch: {SECTIONS_PER_BATCH}")
    print("=" * 60)
    
    # Step 3: Append sections in batches
    success_count = 0
    
    for i in range(0, total_sections, SECTIONS_PER_BATCH):
        batch = sections[i:i + SECTIONS_PER_BATCH]
        batch_num = (i // SECTIONS_PER_BATCH) + 1
        
        if append_sections_batch(lesson_id, batch, batch_num):
            success_count += 1
    
    print("=" * 60)
    print(f"Upload complete!")
    print(f"Lesson ID: {lesson_id}")
    print(f"Successful batches: {success_count}")

if __name__ == "__main__":
    main()
```

---

## Index Mapping Reference

### POST API (Simple)
```
Batch 1: sections[0-9] → section_0 to section_9
Batch 2: sections[0-9] → section_0 to section_9
Batch 3: sections[0-9] → section_0 to section_9
```

### PUT API (Cumulative)
```
Batch 1: sections[0-9] → section_0 to section_9 (total: 10)
Batch 2: sections[10-19] → section_10 to section_19 (total: 20)
Batch 3: sections[20-29] → section_20 to section_29 (total: 30)
```

---

## API Endpoints

### POST - Create New Lesson
```
POST /api/admin/audio-lessons
Content-Type: multipart/form-data
Authorization: Bearer JWT_TOKEN

Fields:
- title (required)
- sections (JSON string)
- section_{idx}_englishAudio (file)
- section_{idx}_subsection_{sub_idx}_englishAudio (file)
```

### PUT - Update Existing Lesson
```
PUT /api/admin/audio-lessons/:id
Content-Type: multipart/form-data
Authorization: Bearer JWT_TOKEN

Fields:
- sections (JSON string - complete array)
- section_{idx}_englishAudio (file)
- section_{idx}_subsection_{sub_idx}_englishAudio (file)
```

---

## Comparison

| Feature | POST API | PUT API |
|---------|----------|---------|
| Index Mapping | Simple (0-based per batch) | Complex (cumulative) |
| Payload Size | Small | Large (all sections) |
| Speed | Fast | Slower |
| Retry Logic | Easy | Complex |
| Result | Multiple lessons | Single lesson |
| **Recommended** | ✅ Yes | For specific cases |

---

## Best Practices

1. **Use POST for bulk uploads** - Simpler and more reliable
2. **Batch size** - 10-20 sections per batch (balance speed vs reliability)
3. **Error handling** - Retry failed batches
4. **File validation** - Check files exist before upload
5. **Progress tracking** - Log each batch result
6. **Close file handles** - Always close files in finally block

---

## Troubleshooting

### 404 Errors on Audio Files
- Check index mapping matches sections array position
- Verify files uploaded to `/uploads/audio/`
- Confirm nginx serves `/uploads/audio/` correctly

### Large Payload Errors
- Reduce batch size
- Check backend body size limits (currently 5GB)

### Timeout Errors
- Reduce batch size
- Increase request timeout
- Use POST instead of PUT
