# Audio Lesson API - Complete Schema & cURL Examples

## Audio Lesson Schema

### Main AudioLesson Schema
```typescript
AudioLesson {
  title: string (required)
  headTitle?: string (optional - main heading)
  description?: string (optional - lesson description)
  totalSections: number (auto-calculated, default: 0)
  totalSubsections: number (auto-calculated, default: 0)
  sections?: AudioSection[] (optional - array of sections)
  category?: string (enum - see categories below)
  tags?: string[] (optional - array of tags)
  uploadedBy?: ObjectId (auto-set, references User)
  isActive: boolean (default: true)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
  
  // Legacy fields (backward compatibility)
  audioUrl?: string
  fileName?: string
  fileSize?: number
  duration?: number
  transcript?: string
  language?: string
}
```

### AudioSection Schema
```typescript
AudioSection {
  title: string (required)
  hindiText?: string (optional)
  englishText?: string (optional)
  easyHindiText?: string (optional - simplified version)
  easyEnglishText?: string (optional - simplified version)
  hindiAudio?: AudioFile (optional)
  englishAudio?: AudioFile (optional)
  easyHindiAudio?: AudioFile (optional)
  easyEnglishAudio?: AudioFile (optional)
  subsections?: AudioSubsection[] (optional)
  totalSubsections: number (auto-calculated, default: 0)
}
```

### AudioSubsection Schema
```typescript
AudioSubsection {
  title: string (required)
  hindiText?: string (optional)
  englishText?: string (optional)
  easyHindiText?: string (optional)
  easyEnglishText?: string (optional)
  hindiAudio?: AudioFile (optional)
  englishAudio?: AudioFile (optional)
  easyHindiAudio?: AudioFile (optional)
  easyEnglishAudio?: AudioFile (optional)
}
```

### AudioFile Schema
```typescript
AudioFile {
  url: string (required - file path)
  fileName: string (required - original filename)
  fileSize: number (required - size in bytes)
  duration?: number (optional - duration in seconds)
}
```

---

# API Endpoints

## POST - Create Audio Lesson
**Endpoint:** `POST /api/admin/audio-lessons`

**Authentication:** Required (JWT Bearer Token)

**Authorization:** ADMIN role required

**Content-Type:** `multipart/form-data`

**Description:** Creates a new audio lesson with optional sections, subsections, and audio files.

## PUT - Update Audio Lesson
**Endpoint:** `PUT /api/admin/audio-lessons/:id`

**Authentication:** Required (JWT Bearer Token)

**Authorization:** ADMIN role required

**Content-Type:** `multipart/form-data`

**Description:** Updates an existing audio lesson. Only provided fields will be updated.

## GET - List Audio Lessons
**Endpoint:** `GET /api/admin/audio-lessons`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `isActive` (optional, boolean)
- `category` (optional, string)

## GET - Get Audio Lesson by ID
**Endpoint:** `GET /api/admin/audio-lessons/:id`

## DELETE - Delete Audio Lesson
**Endpoint:** `DELETE /api/admin/audio-lessons/:id`

## PUT - Update Sections Only
**Endpoint:** `PUT /api/admin/audio-lessons/:id/sections`

**Content-Type:** `application/json`

**Body:**
```json
{
  "sections": [...]
}
```

## GET - Get Categories with Count
**Endpoint:** `GET /api/admin/audio-lessons/categories`

## GET - Get All Available Categories
**Endpoint:** `GET /api/admin/audio-lessons/categories/all`

---

# cURL Examples

## POST - Create Audio Lesson Examples

## Simple Audio Lesson (No Sections)
```bash
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Introduction to Constitutional Law" \
  -F "headTitle=Constitutional Law Basics" \
  -F "description=Learn the fundamentals of constitutional law" \
  -F "category=constitutional-law" \
  -F 'tags=["law", "constitution", "basics"]' \
  -F "englishAudio=@/path/to/english-audio.mp3" \
  -F "hindiAudio=@/path/to/hindi-audio.mp3"
```

## Audio Lesson with Sections
```bash
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Fundamental Rights" \
  -F "headTitle=Understanding Fundamental Rights" \
  -F "description=Deep dive into fundamental rights" \
  -F "category=constitutional-law" \
  -F 'tags=["rights", "constitution"]' \
  -F 'sections=[
    {
      "title": "Right to Equality",
      "hindiText": "समानता का अधिकार",
      "englishText": "Right to Equality",
      "easyHindiText": "सभी को बराबर अधिकार",
      "easyEnglishText": "Equal rights for all"
    },
    {
      "title": "Right to Freedom",
      "hindiText": "स्वतंत्रता का अधिकार",
      "englishText": "Right to Freedom"
    }
  ]' \
  -F "section_0_englishAudio=@/path/to/section0-english.mp3" \
  -F "section_0_hindiAudio=@/path/to/section0-hindi.mp3" \
  -F "section_0_easyEnglishAudio=@/path/to/section0-easy-english.mp3" \
  -F "section_0_easyHindiAudio=@/path/to/section0-easy-hindi.mp3" \
  -F "section_1_englishAudio=@/path/to/section1-english.mp3" \
  -F "section_1_hindiAudio=@/path/to/section1-hindi.mp3"
```

## Audio Lesson with Sections and Subsections
```bash
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Indian Penal Code Overview" \
  -F "category=criminal-law" \
  -F 'sections=[
    {
      "title": "Introduction to IPC",
      "englishText": "The Indian Penal Code",
      "subsections": [
        {
          "title": "History of IPC",
          "englishText": "IPC was drafted in 1860"
        },
        {
          "title": "Structure of IPC",
          "englishText": "IPC has 23 chapters"
        }
      ]
    }
  ]' \
  -F "section_0_englishAudio=@/path/to/section0.mp3" \
  -F "section_0_subsection_0_englishAudio=@/path/to/subsection0-0.mp3" \
  -F "section_0_subsection_1_englishAudio=@/path/to/subsection0-1.mp3"
```

## PUT - Update Audio Lesson Examples

### Update Basic Info
```bash
curl -X PUT http://localhost:3000/api/admin/audio-lessons/LESSON_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Updated Title" \
  -F "description=Updated description" \
  -F "isActive=true"
```

### Update with New Audio Files
```bash
curl -X PUT http://localhost:3000/api/admin/audio-lessons/LESSON_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Updated Lesson" \
  -F "section_0_englishAudio=@/path/to/new-audio.mp3"
```

### Update Sections Only (JSON)
```bash
curl -X PUT http://localhost:3000/api/admin/audio-lessons/LESSON_ID/sections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sections": [
      {
        "title": "Updated Section",
        "englishText": "New content"
      }
    ]
  }'
```

## GET - List Audio Lessons
```bash
curl -X GET "http://localhost:3000/api/admin/audio-lessons?page=1&limit=10&category=constitutional-law" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## GET - Get Single Audio Lesson
```bash
curl -X GET http://localhost:3000/api/admin/audio-lessons/LESSON_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## DELETE - Delete Audio Lesson
```bash
curl -X DELETE http://localhost:3000/api/admin/audio-lessons/LESSON_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## GET - Get Categories
```bash
curl -X GET http://localhost:3000/api/admin/audio-lessons/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Minimal Example
```bash
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Quick Legal Tip" \
  -F "category=general"
```

---

## Available Categories (VALID_CATEGORY_IDS)
- `constitutional-law` - Constitutional Law
- `criminal-law` - Criminal Law
- `civil-law` - Civil Law
- `corporate-law` - Corporate Law
- `family-law` - Family Law
- `property-law` - Property Law
- `tax-law` - Tax Law
- `labor-law` - Labor Law
- `environmental-law` - Environmental Law
- `intellectual-property` - Intellectual Property
- `general` - General Legal Topics

## Audio File Naming Convention
- Section audio: `section_{index}_{language}Audio`
- Subsection audio: `section_{sectionIndex}_subsection_{subsectionIndex}_{language}Audio`
- Languages: `english`, `hindi`, `easyEnglish`, `easyHindi`

## Field Requirements

### Required Fields
- `title` - Lesson title (string)

### Optional Fields
- `headTitle` - Main heading for the lesson
- `description` - Lesson description
- `category` - Must be one of the valid categories above
- `tags` - Array of strings (must be valid JSON in form-data)
- `sections` - Array of section objects (must be valid JSON in form-data)
- `englishTranscription` - Admin-provided English transcription
- `hindiTranscription` - Admin-provided Hindi transcription
- `easyEnglishTranscription` - Simplified English transcription
- `easyHindiTranscription` - Simplified Hindi transcription

### Audio File Fields
- Lesson level: `englishAudio`, `hindiAudio`
- Section level: `section_{index}_englishAudio`, `section_{index}_hindiAudio`, etc.
- Subsection level: `section_{sectionIndex}_subsection_{subsectionIndex}_englishAudio`, etc.
- Supported languages: `english`, `hindi`, `easyEnglish`, `easyHindi`

## Notes
- Replace `YOUR_JWT_TOKEN` with actual JWT token from login
- Requires ADMIN role
- Audio files support: mp3, wav, m4a, aac, ogg, webm, flac, opus
- Max file size: 5GB per file
- Sections and tags must be valid JSON strings when using form-data
- Audio files are optional at all levels
- `totalSections` and `totalSubsections` are auto-calculated
- `uploadedBy` is auto-set from JWT token
- `isActive` defaults to true
