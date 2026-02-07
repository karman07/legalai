# Race Condition in Bulk Upload - CRITICAL ISSUE

## The Problem You Identified

**Expected:** 600 audio files uploaded
**Actual:** Only 264 files on server

**Root Cause:** PUT requests are overlapping and overwriting each other's data.

## What's Happening

```python
# Your loop sends requests like this:
for i in range(batches):
    update_with_sections(lesson_id, batch, i)  # Sends PUT request
    # ❌ Doesn't wait for response before sending next request
```

### Timeline of Race Condition

```
Time 0ms:   Batch 1 PUT starts → Fetches existing sections (0 sections)
Time 100ms: Batch 2 PUT starts → Fetches existing sections (0 sections) ❌
Time 200ms: Batch 3 PUT starts → Fetches existing sections (0 sections) ❌
Time 500ms: Batch 1 PUT completes → Saves sections 0-9
Time 600ms: Batch 2 PUT completes → Saves sections 0-9 (OVERWRITES Batch 1) ❌
Time 700ms: Batch 3 PUT completes → Saves sections 0-9 (OVERWRITES Batch 2) ❌

Result: Only last batch's files remain!
```

## Why Only 264 Files?

If you sent ~60 batches with ~10 files each (600 total), but only the last few batches succeeded before being overwritten, you'd end up with ~264 files (the last 26-27 batches that didn't get overwritten).

## The Fix: Sequential Requests with Wait

### ❌ WRONG - Concurrent Requests
```python
for i in range(0, total_sections, SECTIONS_PER_BATCH):
    batch = sections[i:i + SECTIONS_PER_BATCH]
    batch_num = (i // SECTIONS_PER_BATCH) + 1
    
    # Sends immediately without waiting
    update_with_sections(lesson_id, batch, batch_num)
    # Next iteration starts before previous completes!
```

### ✅ CORRECT - Sequential Requests
```python
import time

for i in range(0, total_sections, SECTIONS_PER_BATCH):
    batch = sections[i:i + SECTIONS_PER_BATCH]
    batch_num = (i // SECTIONS_PER_BATCH) + 1
    
    # Wait for response before continuing
    success = update_with_sections(lesson_id, batch, batch_num)
    
    if not success:
        print(f"Batch {batch_num} failed, stopping...")
        break
    
    # Optional: Add delay between requests
    time.sleep(1)  # 1 second delay
```

## Complete Fixed Script - PUT Method

```python
#!/usr/bin/env python3
import json
import requests
import time
from pathlib import Path

API_URL = "https://api.legalpadhai.ai/api/admin/audio-lessons"
JWT_TOKEN = "YOUR_JWT_TOKEN"
SECTIONS_PER_BATCH = 10
DELAY_BETWEEN_BATCHES = 2  # seconds

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

def get_current_sections(lesson_id):
    """Fetch existing sections - CRITICAL for PUT method"""
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    try:
        response = requests.get(f"{API_URL}/{lesson_id}", headers=headers, timeout=30)
        if response.status_code == 200:
            sections = response.json().get('sections', [])
            print(f"  → Fetched {len(sections)} existing sections")
            return sections
        else:
            print(f"  → Failed to fetch sections: {response.status_code}")
            return []
    except Exception as e:
        print(f"  → Error fetching sections: {e}")
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
    """Update lesson with new sections - WAITS for completion"""
    print(f"\n{'='*60}")
    print(f"[Batch {batch_num}] Starting upload...")
    
    # CRITICAL: Fetch existing sections INSIDE this function
    existing_sections = get_current_sections(lesson_id)
    existing_count = len(existing_sections)
    
    sections_data = []
    files_to_upload = {}
    
    for idx, section_dir in enumerate(sections_batch):
        section_data = build_section_data(section_dir)
        sections_data.append(section_data)
        
        # Position in complete array
        array_position = existing_count + idx
        
        # Main section audio
        audio_files = [
            ("Main_Content.opus", f"section_{array_position}_englishAudio"),
            ("Main_Content_Easy.opus", f"section_{array_position}_easyEnglishAudio")
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
                     f"section_{array_position}_subsection_{sub_idx}_englishAudio"),
                    (f"zz_Illustration_{illus_id}_Easy.opus", 
                     f"section_{array_position}_subsection_{sub_idx}_easyEnglishAudio")
                ]
                
                for audio_file, field_name in sub_audio_files:
                    audio_path = section_dir / audio_file
                    if audio_path.exists():
                        files_to_upload[field_name] = (audio_file, open(audio_path, 'rb'), 'audio/ogg')
    
    # Combine all sections
    all_sections = existing_sections + sections_data
    
    data = {"sections": json.dumps(all_sections)}
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    
    print(f"[Batch {batch_num}] Existing: {existing_count}, Adding: {len(sections_data)}, Total: {len(all_sections)}")
    print(f"[Batch {batch_num}] Uploading {len(files_to_upload)} audio files...")
    
    try:
        # CRITICAL: Wait for response with timeout
        response = requests.put(
            f"{API_URL}/{lesson_id}", 
            headers=headers, 
            data=data, 
            files=files_to_upload,
            timeout=300  # 5 minute timeout
        )
        
        if response.status_code in [200, 201]:
            print(f"[Batch {batch_num}] ✓ SUCCESS - Upload completed")
            return True
        else:
            print(f"[Batch {batch_num}] ✗ FAILED - Status: {response.status_code}")
            print(f"[Batch {batch_num}] Response: {response.text[:500]}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"[Batch {batch_num}] ✗ TIMEOUT - Request took too long")
        return False
    except Exception as e:
        print(f"[Batch {batch_num}] ✗ ERROR - {e}")
        return False
    finally:
        # Close all file handles
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
        print(f"✓ Main lesson created with ID: {lesson_id}\n")
        return lesson_id
    else:
        print(f"✗ Failed to create lesson: {response.status_code}")
        return None

def main():
    # Create main lesson
    lesson_id = create_main_lesson()
    if not lesson_id:
        return
    
    # Get all sections
    sections = get_sections()
    total_sections = len(sections)
    total_batches = (total_sections + SECTIONS_PER_BATCH - 1) // SECTIONS_PER_BATCH
    
    print(f"Total sections: {total_sections}")
    print(f"Sections per batch: {SECTIONS_PER_BATCH}")
    print(f"Total batches: {total_batches}")
    print(f"Delay between batches: {DELAY_BETWEEN_BATCHES}s")
    print("="*60)
    
    success_count = 0
    failed_batches = []
    
    # CRITICAL: Sequential processing with wait
    for i in range(0, total_sections, SECTIONS_PER_BATCH):
        batch = sections[i:i + SECTIONS_PER_BATCH]
        batch_num = (i // SECTIONS_PER_BATCH) + 1
        
        # Wait for this batch to complete before starting next
        if update_with_sections(lesson_id, batch, batch_num):
            success_count += 1
            
            # Delay before next batch to avoid overwhelming server
            if batch_num < total_batches:
                print(f"[Batch {batch_num}] Waiting {DELAY_BETWEEN_BATCHES}s before next batch...")
                time.sleep(DELAY_BETWEEN_BATCHES)
        else:
            failed_batches.append(batch_num)
            
            # Ask user if they want to continue after failure
            response = input(f"\nBatch {batch_num} failed. Continue? (y/n): ")
            if response.lower() != 'y':
                print("Upload stopped by user.")
                break
    
    print("\n" + "="*60)
    print("UPLOAD COMPLETE")
    print("="*60)
    print(f"Lesson ID: {lesson_id}")
    print(f"Total batches: {total_batches}")
    print(f"Successful: {success_count}")
    print(f"Failed: {len(failed_batches)}")
    if failed_batches:
        print(f"Failed batch numbers: {failed_batches}")

if __name__ == "__main__":
    main()
```

## Key Changes

1. **Sequential Processing** - Each batch waits for previous to complete
2. **Timeout Handling** - 5 minute timeout per request
3. **Delay Between Batches** - 2 second delay to avoid overwhelming server
4. **Error Handling** - Stops on failure and asks user to continue
5. **Progress Tracking** - Shows existing/adding/total sections
6. **File Handle Cleanup** - Always closes files in finally block

## Why POST is Better for Bulk Upload

```python
# POST method - No race condition possible
for batch in batches:
    create_lesson_batch(batch)  # Creates new lesson each time
    # No overlap possible - each creates separate lesson
```

## Verification After Upload

```bash
# Check total files uploaded
ls -1 /var/www/backend/uploads/audio/ | wc -l

# Check lesson in database
mongo legalpadhai --eval "db.audiolessons.findOne({_id: ObjectId('YOUR_LESSON_ID')}, {totalSections: 1, 'sections.title': 1})"
```

## Summary

- **Your diagnosis was correct** - PUT requests were overlapping
- **Solution** - Make requests sequential with proper waiting
- **Better approach** - Use POST to create separate lessons per batch
- **Add delays** - 1-2 seconds between batches prevents server overload
- **Monitor progress** - Log each batch's success/failure
