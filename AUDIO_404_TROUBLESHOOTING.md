# Audio File 404 Troubleshooting Guide

## Problem
After bulk uploading audio lessons, the database contains file paths but accessing them returns 404 errors.

## Quick Diagnosis

### Step 1: Check if files exist on server
```bash
# SSH into your server
ssh user@your-server

# Check if files are uploaded
ls -la /var/www/backend/uploads/audio/ | grep "section-"

# Count files
ls -1 /var/www/backend/uploads/audio/ | wc -l
```

### Step 2: Check database paths
```bash
# Connect to MongoDB and check a lesson
mongo
use legalpadhai
db.audiolessons.findOne({}, {sections: 1})
```

Example database path:
```json
{
  "englishAudio": {
    "url": "/uploads/audio/section-0-englishAudio-1234567890-123456789.opus",
    "fileName": "Main_Content.opus",
    "fileSize": 123456
  }
}
```

### Step 3: Test file access
```bash
# Test direct file access
curl -I http://localhost:3000/uploads/audio/section-0-englishAudio-1234567890-123456789.opus

# Test via API domain
curl -I https://api.legalpadhai.ai/uploads/audio/section-0-englishAudio-1234567890-123456789.opus
```

## Common Issues & Solutions

### Issue 1: Files uploaded but wrong path in database

**Symptom:** Files exist in `/var/www/backend/uploads/audio/` but database has incorrect paths

**Cause:** The controller saves paths as `/uploads/audio/filename` but files might be in different location

**Solution:** Verify the controller is setting correct paths

Check controller code:
```typescript
section.englishAudio = {
  url: `/uploads/audio/${sectionFiles.englishAudio.filename}`,
  fileName: sectionFiles.englishAudio.originalname,
  fileSize: sectionFiles.englishAudio.size,
};
```

### Issue 2: Nginx not serving /uploads path

**Symptom:** Files exist, paths are correct, but still 404

**Cause:** Nginx configuration doesn't proxy `/uploads` to backend

**Solution:** Update Nginx config

```nginx
# /etc/nginx/sites-available/api.legalpadhai.ai

server {
    listen 80;
    server_name api.legalpadhai.ai;

    # Serve static files directly from Nginx (RECOMMENDED)
    location /uploads/ {
        alias /var/www/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # Proxy API requests to Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for large uploads
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        client_max_body_size 5G;
    }
}
```

**Apply changes:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Issue 3: File permissions

**Symptom:** Files exist but can't be read

**Cause:** Wrong file permissions

**Solution:** Fix permissions
```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/backend/uploads/

# Set correct permissions
sudo chmod -R 755 /var/www/backend/uploads/
```

### Issue 4: Backend not serving static files

**Symptom:** Files work via Nginx but not via Node.js directly

**Cause:** Backend static file serving misconfigured

**Check:** main.ts configuration
```typescript
// Should have this in main.ts
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads',
});
```

**Test:**
```bash
# Direct backend test (if running on port 3000)
curl -I http://localhost:3000/uploads/audio/your-file.opus
```

### Issue 5: Path mismatch in production

**Symptom:** Works locally but not in production

**Cause:** Different path structure in production

**Solution:** Ensure consistent paths

Local: `./uploads/audio/`
Production: `/var/www/backend/uploads/audio/`

Both should save to database as: `/uploads/audio/filename.opus`

## Verification Script

Create this script to verify everything is working:

```python
#!/usr/bin/env python3
import requests
import json

API_URL = "https://api.legalpadhai.ai/api/admin/audio-lessons"
JWT_TOKEN = "YOUR_JWT_TOKEN"

def verify_lesson(lesson_id):
    """Verify all audio files in a lesson are accessible"""
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    
    # Get lesson
    response = requests.get(f"{API_URL}/{lesson_id}", headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch lesson: {response.status_code}")
        return
    
    lesson = response.json()
    print(f"Lesson: {lesson['title']}")
    print(f"Sections: {len(lesson.get('sections', []))}")
    
    # Check each section's audio files
    errors = []
    success = 0
    
    for idx, section in enumerate(lesson.get('sections', [])):
        print(f"\nSection {idx}: {section['title']}")
        
        # Check section audio files
        for audio_type in ['englishAudio', 'hindiAudio', 'easyEnglishAudio', 'easyHindiAudio']:
            if audio_type in section:
                url = section[audio_type]['url']
                full_url = f"https://api.legalpadhai.ai{url}"
                
                try:
                    r = requests.head(full_url, timeout=5)
                    if r.status_code == 200:
                        print(f"  ✓ {audio_type}: OK")
                        success += 1
                    else:
                        print(f"  ✗ {audio_type}: {r.status_code}")
                        errors.append(f"Section {idx} {audio_type}: {url}")
                except Exception as e:
                    print(f"  ✗ {audio_type}: ERROR - {e}")
                    errors.append(f"Section {idx} {audio_type}: {url}")
        
        # Check subsection audio files
        for sub_idx, subsection in enumerate(section.get('subsections', [])):
            print(f"  Subsection {sub_idx}: {subsection['title']}")
            
            for audio_type in ['englishAudio', 'hindiAudio', 'easyEnglishAudio', 'easyHindiAudio']:
                if audio_type in subsection:
                    url = subsection[audio_type]['url']
                    full_url = f"https://api.legalpadhai.ai{url}"
                    
                    try:
                        r = requests.head(full_url, timeout=5)
                        if r.status_code == 200:
                            print(f"    ✓ {audio_type}: OK")
                            success += 1
                        else:
                            print(f"    ✗ {audio_type}: {r.status_code}")
                            errors.append(f"Section {idx} Subsection {sub_idx} {audio_type}: {url}")
                    except Exception as e:
                        print(f"    ✗ {audio_type}: ERROR - {e}")
                        errors.append(f"Section {idx} Subsection {sub_idx} {audio_type}: {url}")
    
    print("\n" + "="*60)
    print(f"Verification complete!")
    print(f"Success: {success}")
    print(f"Errors: {len(errors)}")
    
    if errors:
        print("\nFailed files:")
        for error in errors[:10]:  # Show first 10
            print(f"  - {error}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more")

if __name__ == "__main__":
    lesson_id = input("Enter lesson ID: ")
    verify_lesson(lesson_id)
```

## Root Cause Analysis

Based on your file listing, the files ARE being uploaded with names like:
- `section-11-subsection-0-easyEnglishAudio-1770467585587-665240258.opus`

This means the controller IS processing them, but the issue is likely:

1. **Database stores wrong path** - Check if DB has the exact filename
2. **Nginx not configured** - Nginx needs to serve `/uploads/` path
3. **Path prefix issue** - Files might be at `/api/uploads/` instead of `/uploads/`

## Recommended Fix

### Option 1: Nginx serves static files (BEST)

```nginx
location /uploads/ {
    alias /var/www/backend/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin "*";
}
```

### Option 2: Backend serves via /api prefix

Update controller to save paths as `/api/uploads/audio/filename`:

```typescript
section.englishAudio = {
  url: `/api/uploads/audio/${sectionFiles.englishAudio.filename}`,
  // ...
};
```

But this requires backend to handle it, which is slower.

## Quick Test

```bash
# 1. Pick a file from your listing
FILE="section-11-subsection-0-easyEnglishAudio-1770467585587-665240258.opus"

# 2. Test direct access
curl -I https://api.legalpadhai.ai/uploads/audio/$FILE

# 3. If 404, test with /api prefix
curl -I https://api.legalpadhai.ai/api/uploads/audio/$FILE

# 4. Check if file exists on server
ssh your-server "ls -la /var/www/backend/uploads/audio/$FILE"
```

## Next Steps

1. Run the quick test above
2. Share the results
3. Check your Nginx configuration
4. Verify database paths match actual filenames
