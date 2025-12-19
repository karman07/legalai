# Audio Lessons Schema Documentation

## Overview
The Audio Lessons system supports dual language audio content with admin-provided transcriptions and section-based organization.

## Schema Structure

### AudioLesson Schema
```typescript
{
  _id: ObjectId,
  title: string (required),
  description?: string,
  
  // Dual Language Audio Files
  englishAudio?: {
    url: string,
    fileName: string,
    fileSize: number,
    duration?: number
  },
  hindiAudio?: {
    url: string,
    fileName: string,
    fileSize: number,
    duration?: number
  },
  
  // Admin-provided Transcriptions
  englishTranscription?: string,
  hindiTranscription?: string,
  easyEnglishTranscription?: string,
  easyHindiTranscription?: string,
  
  // Section-based Content
  sections?: [{
    title: string,
    startTime: number, // seconds
    endTime: number,   // seconds
    hindiText?: string,
    englishText?: string,
    easyHindiText?: string,
    easyEnglishText?: string
  }],
  
  category?: string,
  tags?: string[],
  uploadedBy?: ObjectId,
  isActive: boolean (default: true),
  
  // Legacy fields (backward compatibility)
  audioUrl?: string,
  fileName?: string,
  fileSize?: number,
  duration?: number,
  transcript?: string,
  language?: string,
  
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features

### Dual Language Support
- **englishAudio**: English audio file with metadata
- **hindiAudio**: Hindi audio file with metadata
- Both files are optional, at least one required

### Admin-Provided Transcriptions
- **englishTranscription**: Full English transcript
- **hindiTranscription**: Full Hindi transcript
- **easyEnglishTranscription**: Simplified English version
- **easyHindiTranscription**: Simplified Hindi version

### Section-Based Organization
- **sections**: Array of time-stamped content sections
- Each section contains:
  - Title and time range (startTime/endTime)
  - Text in multiple languages and difficulty levels
  - Flexible metadata structure

### Backward Compatibility
- Legacy single-audio format still supported
- Old fields maintained for existing data
- Seamless migration path

## Database Indexes
- `title`: Text search optimization
- `category`: Category filtering
- `tags`: Tag-based queries
- `isActive`: Active content filtering
- `createdAt`: Chronological sorting

## Usage Examples

### Basic Audio Lesson
```json
{
  "title": "Constitutional Law Basics",
  "description": "Introduction to constitutional principles",
  "englishAudio": {
    "url": "/uploads/audio/const-law-en.mp3",
    "fileName": "constitutional-law-english.mp3",
    "fileSize": 2048000,
    "duration": 600
  },
  "hindiAudio": {
    "url": "/uploads/audio/const-law-hi.mp3",
    "fileName": "constitutional-law-hindi.mp3",
    "fileSize": 2156000,
    "duration": 620
  },
  "category": "constitutional-law",
  "tags": ["law", "constitution", "basics"]
}
```

### With Admin Transcriptions
```json
{
  "title": "Legal Procedures",
  "englishTranscription": "Today we will discuss the fundamental legal procedures...",
  "hindiTranscription": "आज हम मौलिक कानूनी प्रक्रियाओं पर चर्चा करेंगे...",
  "easyEnglishTranscription": "We will learn about basic legal steps...",
  "easyHindiTranscription": "हम बुनियादी कानूनी चरणों के बारे में सीखेंगे..."
}
```

### With Sections
```json
{
  "title": "Court Procedures",
  "sections": [
    {
      "title": "Introduction",
      "startTime": 0,
      "endTime": 120,
      "englishText": "Welcome to court procedures",
      "hindiText": "न्यायालयी प्रक्रियाओं में आपका स्वागत है",
      "easyEnglishText": "Learn about court steps",
      "easyHindiText": "न्यायालय के चरणों के बारे में जानें"
    },
    {
      "title": "Filing Process",
      "startTime": 120,
      "endTime": 300,
      "englishText": "The filing process involves...",
      "hindiText": "दाखिल करने की प्रक्रिया में शामिल है..."
    }
  ]
}
```

## API Endpoints

### Create Audio Lesson
**POST** `/api/admin/audio-lessons`

```bash
# With file upload
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Legal Basics" \
  -F "description=Introduction to legal concepts" \
  -F "category=legal-basics" \
  -F "englishAudio=@english-audio.mp3" \
  -F "hindiAudio=@hindi-audio.mp3" \
  -F "englishTranscription=Welcome to legal basics..." \
  -F "hindiTranscription=कानूनी मूल बातों में आपका स्वागत है..."

# With JSON data
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Legal Basics",
    "description": "Introduction to legal concepts",
    "englishTranscription": "Welcome to legal basics...",
    "hindiTranscription": "कानूनी मूल बातों में आपका स्वागत है...",
    "sections": [
      {
        "title": "Introduction",
        "startTime": 0,
        "endTime": 30,
        "englishText": "Welcome to legal basics",
        "hindiText": "कानूनी मूल बातों में आपका स्वागत है"
      }
    ]
  }'
```

### Get All Audio Lessons
**GET** `/api/admin/audio-lessons`

```bash
# Get all lessons
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/admin/audio-lessons"

# With pagination
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/admin/audio-lessons?page=1&limit=10"

# Filter by category
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/admin/audio-lessons?category=constitutional-law"

# Filter active lessons
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/admin/audio-lessons?isActive=true"
```

### Get Single Audio Lesson
**GET** `/api/admin/audio-lessons/:id`

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345"
```

### Update Audio Lesson
**PUT** `/api/admin/audio-lessons/:id`

```bash
# Update basic info
curl -X PUT http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Legal Basics",
    "description": "Updated description",
    "englishTranscription": "Updated English transcription..."
  }'

# Update with new audio files
curl -X PUT http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Updated Legal Basics" \
  -F "englishAudio=@new-english-audio.mp3"
```

### Update Sections
**PUT** `/api/admin/audio-lessons/:id/sections`

```bash
curl -X PUT http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345/sections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sections": [
      {
        "title": "Introduction",
        "startTime": 0,
        "endTime": 60,
        "englishText": "Introduction to legal concepts",
        "hindiText": "कानूनी अवधारणाओं का परिचय",
        "easyEnglishText": "Basic law ideas",
        "easyHindiText": "बुनियादी कानून के विचार"
      },
      {
        "title": "Key Points",
        "startTime": 60,
        "endTime": 180,
        "englishText": "Important legal principles",
        "hindiText": "महत्वपूर्ण कानूनी सिद्धांत"
      }
    ]
  }'
```

### Delete Audio Lesson
**DELETE** `/api/admin/audio-lessons/:id`

```bash
curl -X DELETE http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Design Principles

### Flexibility
- Optional fields allow gradual content building
- Multiple transcription levels for different audiences
- Section-based organization for detailed content

### Scalability
- Indexed fields for fast queries
- Lean document structure
- Efficient file storage references

### User Experience
- Dual language support for broader accessibility
- Easy and complex versions for different skill levels
- Time-stamped sections for precise navigation

### Admin Control
- Manual transcription input (no automatic processing)
- Section management with flexible metadata
- Category and tag organization