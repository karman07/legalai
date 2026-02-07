# Simplified Bulk Upload Script - Using New Append Endpoint

## New API Endpoint

```
POST /api/admin/audio-lessons/:id/append-sections
```

**Benefits:**
- Server-side appending (no race conditions)
- Simple 0-based indexing for each batch
- Automatic section counting
- Returns added count and total

## Simplified Python Script

```python
#!/usr/bin/env python3
import json
import requests
import time
from pathlib import Path

API_URL = "https://api.legalpadhai.ai/api/admin/audio-lessons"
JWT_TOKEN = "YOUR_JWT_TOKEN"
SECTIONS_PER_BATCH = 10

def read_file(path):
    if path.exists():
        return path.read_text(encoding='utf-8').strip()
    return None

def get_sections():
    sections = [d for d in Path('.').iterdir() if d.is_dir() and d.name.startswith('Section_')]
    def sort_key(x):
        num = x.name.split('_')[1]
        try:
            return (int(num), '')
        except ValueError:
            return (int(''.join(c for c in num if c.isdigit())), num)
    return sorted(sections, key=sort_key)

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

def append_sections_batch(lesson_id, sections_batch, batch_num):
    """Append sections using new endpoint - NO race condition!"""
    print(f"\n[Batch {batch_num}] Starting upload...")
    
    sections_data = []
    files_to_upload = {}
    
    # Simple 0-based indexing for THIS batch
    for idx, section_dir in enumerate(sections_batch):
        section_data = build_section_data(section_dir)
        sections_data.append(section_data)
        
        # Audio files (idx is 0-based for this batch)
        audio_files = [
            ("Main_Content.opus", f"section_{idx}_englishAudio"),
            ("Main_Content_Easy.opus", f"section_{idx}_easyEnglishAudio")
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
                     f"section_{idx}_subsection_{sub_idx}_englishAudio"),
                    (f"zz_Illustration_{illus_id}_Easy.opus", 
                     f"section_{idx}_subsection_{sub_idx}_easyEnglishAudio")
                ]
                
                for audio_file, field_name in sub_audio_files:
                    audio_path = section_dir / audio_file
                    if audio_path.exists():
                        files_to_upload[field_name] = (audio_file, open(audio_path, 'rb'), 'audio/ogg')
    
    # Send only NEW sections (server handles appending)
    data = {"sections": json.dumps(sections_data)}
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    
    print(f"[Batch {batch_num}] Uploading {len(sections_data)} sections with {len(files_to_upload)} audio files...")
    
    try:
        response = requests.post(
            f"{API_URL}/{lesson_id}/append-sections",
            headers=headers,
            data=data,
            files=files_to_upload,
            timeout=300
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"[Batch {batch_num}] ✓ SUCCESS")
            print(f"  → Added: {result.get('addedSections', len(sections_data))}")
            print(f"  → Total: {result.get('totalSections', 'N/A')}")
            return True
        else:
            print(f"[Batch {batch_num}] ✗ FAILED - Status: {response.status_code}")
            print(f"  → Response: {response.text[:300]}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"[Batch {batch_num}] ✗ TIMEOUT")
        return False
    except Exception as e:
        print(f"[Batch {batch_num}] ✗ ERROR - {e}")
        return False
    finally:
        for f in files_to_upload.values():
            if isinstance(f, tuple):
                f[1].close()

def create_main_lesson():
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
        print(f"✓ Main lesson created: {lesson_id}\n")
        return lesson_id
    else:
        print(f"✗ Failed: {response.status_code}")
        return None

def main():
    # Create main lesson
    lesson_id = create_main_lesson()
    if not lesson_id:
        return
    
    # Get sections
    sections = get_sections()
    total_sections = len(sections)
    total_batches = (total_sections + SECTIONS_PER_BATCH - 1) // SECTIONS_PER_BATCH
    
    print(f"Total sections: {total_sections}")
    print(f"Batches: {total_batches}")
    print("="*60)
    
    success_count = 0
    failed_batches = []
    
    # Upload batches sequentially
    for i in range(0, total_sections, SECTIONS_PER_BATCH):
        batch = sections[i:i + SECTIONS_PER_BATCH]
        batch_num = (i // SECTIONS_PER_BATCH) + 1
        
        if append_sections_batch(lesson_id, batch, batch_num):
            success_count += 1
            time.sleep(1)  # 1 second delay
        else:
            failed_batches.append(batch_num)
            retry = input(f"\nRetry batch {batch_num}? (y/n): ")
            if retry.lower() == 'y':
                if append_sections_batch(lesson_id, batch, batch_num):
                    success_count += 1
                    failed_batches.remove(batch_num)
            else:
                cont = input("Continue with next batch? (y/n): ")
                if cont.lower() != 'y':
                    break
    
    print("\n" + "="*60)
    print("UPLOAD COMPLETE")
    print("="*60)
    print(f"Lesson ID: {lesson_id}")
    print(f"Successful: {success_count}/{total_batches}")
    if failed_batches:
        print(f"Failed batches: {failed_batches}")

if __name__ == "__main__":
    main()
```

## Key Improvements

1. **No Race Conditions** - Server handles appending atomically
2. **Simple Indexing** - Always 0-based for each batch
3. **No Fetching** - Don't need to fetch existing sections
4. **Automatic Counting** - Server calculates totals
5. **Retry Logic** - Built-in retry for failed batches

## API Comparison

### Old PUT Method (Race Condition)
```python
# Client fetches existing sections
existing = get_sections(lesson_id)  # Race condition here!
all_sections = existing + new_sections
update(lesson_id, all_sections)
```

### New POST Append Method (No Race Condition)
```python
# Server handles everything
append_sections(lesson_id, new_sections)  # Atomic operation!
```

## Usage

```bash
# 1. Update JWT_TOKEN in script
# 2. Run script
python3 bulk_upload_simplified.py

# 3. Monitor progress
# Each batch shows:
#   - Sections being uploaded
#   - Audio files count
#   - Success/failure status
#   - Running totals
```

## Error Handling

- **Timeout**: Automatically detected, option to retry
- **Network Error**: Caught and logged, option to retry
- **Server Error**: Shows response, option to continue
- **Failed Batch**: Option to retry or skip

## Verification

```bash
# Check uploaded files
ls -1 /var/www/backend/uploads/audio/ | wc -l

# Check lesson in database
curl -H "Authorization: Bearer JWT_TOKEN" \
  https://api.legalpadhai.ai/api/admin/audio-lessons/LESSON_ID
```

## Benefits Over Old Method

| Feature | Old PUT | New POST Append |
|---------|---------|-----------------|
| Race Conditions | ❌ Yes | ✅ No |
| Index Complexity | ❌ Complex | ✅ Simple |
| Fetch Required | ❌ Yes | ✅ No |
| Payload Size | ❌ Large | ✅ Small |
| Speed | ❌ Slow | ✅ Fast |
| Reliability | ❌ Low | ✅ High |
