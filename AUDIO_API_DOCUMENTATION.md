# Audio Lessons API Documentation

## Overview
The Audio Lessons API supports a comprehensive audio management system with dual language support (English/Hindi), automatic transcription, easy language generation, and section-based content organization.

## Features
- ✅ English and Hindi audio file support
- ✅ Audio URL fetching and server storage
- ✅ Automatic transcription with multiple providers
- ✅ Easy language text generation
- ✅ Section-based content with timestamps
- ✅ Backward compatibility with legacy format

## API Endpoints

### Create Audio Lesson
**POST** `/api/admin/audio-lessons`

#### Request Format (Multipart Form Data)

**Basic Fields:**
```
title: string (required)
description: string (optional)
category: string (optional)
tags: JSON string array (optional)
sections: JSON string array (optional)
```

**Audio Files:**
```
englishAudio: File (optional) - English audio file
hindiAudio: File (optional) - Hindi audio file
file: File (optional) - Legacy single audio file
```

**Audio URLs:**
```
englishAudioUrl: string (optional) - URL to English audio
hindiAudioUrl: string (optional) - URL to Hindi audio
```

**Sections Format:**
```json
[
  {
    "title": "Introduction",
    "startTime": 0,
    "endTime": 30,
    "hindiText": "परिचय",
    "englishText": "Introduction",
    "easyHindiText": "आसान परिचय",
    "easyEnglishText": "Simple Introduction"
  }
]
```

#### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Legal Basics" \
  -F "description=Introduction to legal concepts" \
  -F "category=legal-basics" \
  -F "tags=[\"law\", \"basics\", \"introduction\"]" \
  -F "englishAudio=@english-audio.mp3" \
  -F "hindiAudio=@hindi-audio.mp3" \
  -F "sections=[{\"title\":\"Introduction\",\"startTime\":0,\"endTime\":30}]"
```

#### Example Request (URL-based)
```bash
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Legal Basics",
    "description": "Introduction to legal concepts",
    "englishAudioUrl": "https://example.com/audio/english.mp3",
    "hindiAudioUrl": "https://example.com/audio/hindi.mp3",
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

### Update Audio Lesson
**PUT** `/api/admin/audio-lessons/:id`

Same format as create, but all fields are optional.

### Get Audio Lesson
**GET** `/api/admin/audio-lessons/:id`

#### Response Format
```json
{
  "_id": "lesson_id",
  "title": "Legal Basics",
  "description": "Introduction to legal concepts",
  "englishAudio": {
    "url": "/uploads/audio/english-123456789.mp3",
    "fileName": "english-audio.mp3",
    "fileSize": 1024000,
    "duration": 300
  },
  "hindiAudio": {
    "url": "/uploads/audio/hindi-123456789.mp3",
    "fileName": "hindi-audio.mp3",
    "fileSize": 1024000,
    "duration": 295
  },
  "englishTranscription": {
    "original": "Welcome to legal basics...",
    "easyLanguage": "This is about law basics...",
    "status": "completed",
    "error": null
  },
  "hindiTranscription": {
    "original": "कानूनी मूल बातों में आपका स्वागत है...",
    "easyLanguage": "यह कानून की बुनियादी बातों के बारे में है...",
    "status": "completed",
    "error": null
  },
  "sections": [
    {
      "title": "Introduction",
      "startTime": 0,
      "endTime": 30,
      "hindiText": "कानूनी मूल बातों में आपका स्वागत है",
      "englishText": "Welcome to legal basics",
      "easyHindiText": "कानून की बुनियादी बातें",
      "easyEnglishText": "Basic law concepts"
    }
  ],
  "category": "legal-basics",
  "tags": ["law", "basics"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### List Audio Lessons
**GET** `/api/admin/audio-lessons`

#### Query Parameters
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `isActive`: boolean
- `category`: string

### Retry Transcription
**POST** `/api/admin/audio-lessons/:id/retry-transcription`

Retries transcription for both English and Hindi audio files.

### Generate Easy Language
**POST** `/api/admin/audio-lessons/:id/generate-easy-language`

#### Request Body
```json
{
  "language": "english" // or "hindi"
}
```

Generates easy-to-understand version of the transcription using AI.

### Update Sections
**PUT** `/api/admin/audio-lessons/:id/sections`

#### Request Body
```json
{
  "sections": [
    {
      "title": "Section 1",
      "startTime": 0,
      "endTime": 60,
      "hindiText": "सेक्शन 1 का टेक्स्ट",
      "englishText": "Section 1 text",
      "easyHindiText": "आसान हिंदी टेक्स्ट",
      "easyEnglishText": "Easy English text"
    }
  ]
}
```

### Delete Audio Lesson
**DELETE** `/api/admin/audio-lessons/:id`

Deletes the lesson and associated audio files from the server.

## Configuration

### Environment Variables
```env
# Transcription Method (openai, whisper-local, assemblyai, none)
TRANSCRIPTION_METHOD=openai

# OpenAI API Key (for transcription and easy language generation)
OPENAI_API_KEY=your_openai_api_key

# AssemblyAI API Key (alternative transcription service)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

### Supported Audio Formats
- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- AAC (.aac)
- OGG (.ogg)
- WebM (.webm)
- FLAC (.flac)

### File Size Limits
- Maximum file size: 500MB per audio file
- Recommended: Keep files under 100MB for better performance

## Transcription Process

### Automatic Transcription
1. Audio file is uploaded or URL is provided
2. File is stored on server
3. Transcription job is queued
4. AI service processes the audio
5. Original transcript is saved
6. Easy language version is generated
7. Status is updated to "completed"

### Transcription Status
- `pending`: Waiting to be processed
- `processing`: Currently being transcribed
- `completed`: Successfully transcribed
- `failed`: Transcription failed (check error field)

## Error Handling

### Common Error Responses
```json
{
  "statusCode": 400,
  "message": "At least one audio file or URL is required",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 404,
  "message": "Audio lesson not found",
  "error": "Not Found"
}
```

### Transcription Errors
- Invalid audio format
- File too large
- Network timeout
- API key issues
- Audio quality too poor

## Best Practices

### File Management
1. Use descriptive filenames
2. Compress audio files before upload
3. Test audio quality before processing
4. Keep backup copies of original files

### Transcription Quality
1. Use clear, high-quality audio
2. Minimize background noise
3. Speak clearly and at moderate pace
4. Use appropriate language settings

### Section Management
1. Create logical time-based sections
2. Provide both language texts when possible
3. Keep section titles descriptive
4. Ensure timestamps don't overlap

## Migration from Legacy Format

### Backward Compatibility
The new system maintains full backward compatibility with the old single-audio format:

```json
{
  "audioUrl": "/uploads/audio/legacy-file.mp3",
  "fileName": "legacy-file.mp3",
  "fileSize": 1024000,
  "transcript": "Legacy transcript text",
  "transcriptionStatus": "completed"
}
```

### Migration Steps
1. Existing lessons continue to work
2. New features available for new lessons
3. Update existing lessons to use new format
4. Gradually migrate legacy data

## Examples

### Complete Workflow Example
```bash
# 1. Create lesson with both audio files
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Constitutional Law Basics" \
  -F "description=Introduction to constitutional principles" \
  -F "category=constitutional-law" \
  -F "englishAudio=@constitution-en.mp3" \
  -F "hindiAudio=@constitution-hi.mp3"

# 2. Wait for transcription to complete (check status)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/audio-lessons/LESSON_ID

# 3. Add sections with timestamps
curl -X PUT http://localhost:3000/api/admin/audio-lessons/LESSON_ID/sections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sections": [
      {
        "title": "Introduction",
        "startTime": 0,
        "endTime": 120,
        "englishText": "Introduction to constitutional law",
        "hindiText": "संवैधानिक कानून का परिचय"
      }
    ]
  }'

# 4. Generate easy language versions
curl -X POST http://localhost:3000/api/admin/audio-lessons/LESSON_ID/generate-easy-language \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language": "english"}'

curl -X POST http://localhost:3000/api/admin/audio-lessons/LESSON_ID/generate-easy-language \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language": "hindi"}'
```

This comprehensive audio system provides everything needed for a modern, multilingual educational platform with automatic transcription and intelligent content processing.