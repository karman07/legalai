# Audio Lessons CRUD API Documentation

## Overview
Complete CRUD operations for audio lessons with dual language support (English/Hindi), admin-provided transcriptions, and section management.

## Schema Structure
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "englishAudio": {
    "url": "string",
    "fileName": "string",
    "fileSize": "number",
    "duration": "number (optional)"
  },
  "hindiAudio": {
    "url": "string", 
    "fileName": "string",
    "fileSize": "number",
    "duration": "number (optional)"
  },
  "englishTranscription": "string (admin-provided)",
  "hindiTranscription": "string (admin-provided)",
  "easyEnglishTranscription": "string (admin-provided)",
  "easyHindiTranscription": "string (admin-provided)",
  "sections": [
    {
      "title": "string",
      "startTime": "number (seconds)",
      "endTime": "number (seconds)",
      "hindiText": "string",
      "englishText": "string",
      "easyHindiText": "string", 
      "easyEnglishText": "string"
    }
  ],
  "category": "string",
  "tags": ["string"],
  "uploadedBy": "ObjectId",
  "isActive": "boolean (default: true)"
}
```

## CREATE - Audio Lesson

### POST `/api/admin/audio-lessons`

#### Option 1: File Upload (Multipart Form Data)
```bash
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Constitutional Law Fundamentals" \
  -F "description=Complete guide to constitutional principles and fundamental rights" \
  -F "category=constitutional-law" \
  -F "tags=[\"constitution\", \"law\", \"rights\", \"government\"]" \
  -F "englishTranscription=Welcome to constitutional law. The Constitution is the supreme law of our country that establishes the framework of government and guarantees fundamental rights to all citizens." \
  -F "hindiTranscription=संवैधानिक कानून में आपका स्वागत है। संविधान हमारे देश का सर्वोच्च कानून है जो सरकार का ढांचा स्थापित करता है और सभी नागरिकों को मौलिक अधिकारों की गारंटी देता है।" \
  -F "easyEnglishTranscription=This lesson is about the Constitution. The Constitution is like the main rulebook for our country that tells us how government should work." \
  -F "easyHindiTranscription=यह पाठ संविधान के बारे में है। संविधान हमारे देश की मुख्य नियम पुस्तिका की तरह है जो हमें बताती है कि सरकार को कैसे काम करना चाहिए।" \
  -F "englishAudio=@constitutional-law-english.mp3" \
  -F "hindiAudio=@constitutional-law-hindi.mp3" \
  -F "sections=[{\"title\":\"Introduction to Constitution\",\"startTime\":0,\"endTime\":180,\"englishText\":\"The Constitution is the supreme law that governs our nation\",\"hindiText\":\"संविधान सर्वोच्च कानून है जो हमारे राष्ट्र को नियंत्रित करता है\",\"easyEnglishText\":\"The Constitution is the most important law in our country\",\"easyHindiText\":\"संविधान हमारे देश का सबसे महत्वपूर्ण कानून है\"},{\"title\":\"Fundamental Rights\",\"startTime\":180,\"endTime\":360,\"englishText\":\"Fundamental rights are basic human rights guaranteed by the Constitution\",\"hindiText\":\"मौलिक अधिकार संविधान द्वारा गारंटीशुदा बुनियादी मानव अधिकार हैं\",\"easyEnglishText\":\"Fundamental rights are basic rights that every person should have\",\"easyHindiText\":\"मौलिक अधिकार बुनियादी अधिकार हैं जो हर व्यक्ति के पास होने चाहिए\"}]"
```

#### Option 2: Audio URLs (JSON)
```bash
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Criminal Law Fundamentals",
    "description": "Complete overview of criminal law principles and procedures",
    "category": "criminal-law",
    "tags": ["criminal", "law", "procedure", "evidence"],
    "englishAudioUrl": "https://example.com/audio/criminal-law-english.mp3",
    "hindiAudioUrl": "https://example.com/audio/criminal-law-hindi.mp3",
    "englishTranscription": "Criminal law is a system of laws that deals with crimes and their punishments. It serves to protect society by defining what constitutes criminal behavior.",
    "hindiTranscription": "आपराधिक कानून कानूनों की एक प्रणाली है जो अपराधों और उनकी सजा से संबंधित है। यह आपराधिक व्यवहार को परिभाषित करके समाज की रक्षा करता है।",
    "easyEnglishTranscription": "Criminal law is about bad things people do and how they get punished. When someone does something wrong, there are rules about what happens to them.",
    "easyHindiTranscription": "आपराधिक कानून उन बुरे कामों के बारे में है जो लोग करते हैं और उन्हें कैसे सजा मिलती है। जब कोई कुछ गलत करता है, तो नियम हैं कि उनके साथ क्या होता है।",
    "sections": [
      {
        "title": "What is Criminal Law",
        "startTime": 0,
        "endTime": 120,
        "englishText": "Criminal law defines crimes and establishes punishments for criminal behavior in society",
        "hindiText": "आपराधिक कानून अपराधों को परिभाषित करता है और समाज में आपराधिक व्यवहार के लिए सजा स्थापित करता है",
        "easyEnglishText": "Criminal law tells us what bad things are crimes and what happens when people do them",
        "easyHindiText": "आपराधिक कानून हमें बताता है कि कौन से बुरे काम अपराध हैं और जब लोग उन्हें करते हैं तो क्या होता है"
      }
    ]
  }'
```

#### Minimal Required Fields
```bash
curl -X POST http://localhost:3000/api/admin/audio-lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Basic Legal Terms" \
  -F "englishAudio=@legal-terms.mp3"
```

## READ - Audio Lessons

### GET All Audio Lessons
**GET** `/api/admin/audio-lessons`

```bash
# Get all lessons (paginated)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/admin/audio-lessons"

# With pagination and filters
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/admin/audio-lessons?page=1&limit=10&isActive=true&category=constitutional-law"
```

### GET Single Audio Lesson
**GET** `/api/admin/audio-lessons/:id`

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345"
```

#### Response Format
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Constitutional Law Fundamentals",
  "description": "Complete guide to constitutional principles",
  "englishAudio": {
    "url": "/uploads/audio/english-1708123456789.mp3",
    "fileName": "constitutional-law-english.mp3",
    "fileSize": 15728640,
    "duration": 1200
  },
  "hindiAudio": {
    "url": "/uploads/audio/hindi-1708123456790.mp3",
    "fileName": "constitutional-law-hindi.mp3",
    "fileSize": 14680064,
    "duration": 1180
  },
  "englishTranscription": "Welcome to constitutional law. The Constitution is the supreme law...",
  "hindiTranscription": "संवैधानिक कानून में आपका स्वागत है। संविधान हमारे देश का सर्वोच्च कानून है...",
  "easyEnglishTranscription": "This lesson is about the Constitution. The Constitution is like...",
  "easyHindiTranscription": "यह पाठ संविधान के बारे में है। संविधान हमारे देश की मुख्य नियम पुस्तिका...",
  "sections": [
    {
      "title": "Introduction to Constitution",
      "startTime": 0,
      "endTime": 180,
      "englishText": "The Constitution is the supreme law that governs our nation",
      "hindiText": "संविधान सर्वोच्च कानून है जो हमारे राष्ट्र को नियंत्रित करता है",
      "easyEnglishText": "The Constitution is the most important law in our country",
      "easyHindiText": "संविधान हमारे देश का सबसे महत्वपूर्ण कानून है"
    }
  ],
  "category": "constitutional-law",
  "tags": ["constitution", "law", "rights"],
  "uploadedBy": "65f0987654321abcdef09876",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## UPDATE - Audio Lesson

### PUT `/api/admin/audio-lessons/:id`

#### Update with New Audio Files
```bash
curl -X PUT http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Updated Constitutional Law Guide" \
  -F "description=Updated comprehensive guide with new content" \
  -F "englishTranscription=Updated English transcription content..." \
  -F "hindiTranscription=अपडेटेड हिंदी ट्रांसक्रिप्शन सामग्री..." \
  -F "englishAudio=@updated-english-audio.mp3" \
  -F "hindiAudio=@updated-hindi-audio.mp3" \
  -F "tags=[\"constitution\", \"law\", \"updated\", \"2024\"]"
```

#### Update with Audio URLs
```bash
curl -X PUT http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Criminal Law Guide",
    "description": "Updated with latest amendments and cases",
    "englishAudioUrl": "https://example.com/updated-criminal-law-en.mp3",
    "hindiAudioUrl": "https://example.com/updated-criminal-law-hi.mp3",
    "englishTranscription": "Updated English transcription...",
    "easyEnglishTranscription": "Updated easy English version...",
    "tags": ["criminal", "law", "updated", "amendments"]
  }'
```

#### Update Only Text Content
```bash
curl -X PUT http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description with more details",
    "englishTranscription": "Corrected English transcription...",
    "hindiTranscription": "सुधारा गया हिंदी ट्रांसक्रिप्शन...",
    "tags": ["constitution", "law", "corrected"]
  }'
```

### PUT Update Sections Only
**PUT** `/api/admin/audio-lessons/:id/sections`

```bash
curl -X PUT http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345/sections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sections": [
      {
        "title": "Updated Introduction",
        "startTime": 0,
        "endTime": 120,
        "englishText": "Updated introduction to constitutional law with recent developments",
        "hindiText": "हाल के विकास के साथ संवैधानिक कानून का अपडेटेड परिचय",
        "easyEnglishText": "New introduction about constitution law with recent changes",
        "easyHindiText": "हाल के बदलावों के साथ संविधान कानून के बारे में नया परिचय"
      },
      {
        "title": "New Section on Recent Amendments",
        "startTime": 120,
        "endTime": 240,
        "englishText": "This section covers the latest constitutional amendments",
        "hindiText": "यह खंड नवीनतम संवैधानिक संशोधनों को कवर करता है",
        "easyEnglishText": "This part talks about new changes to the constitution",
        "easyHindiText": "यह भाग संविधान में नए बदलावों के बारे में बात करता है"
      }
    ]
  }'
```

## DELETE - Audio Lesson

### DELETE `/api/admin/audio-lessons/:id`

```bash
curl -X DELETE http://localhost:3000/api/admin/audio-lessons/65f1234567890abcdef12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response
```json
{
  "message": "Audio lesson deleted successfully",
  "id": "65f1234567890abcdef12345"
}
```

## Additional Operations

### Get Categories
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/admin/audio-lessons/categories"
```

### Get All Available Categories
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/admin/audio-lessons/categories/all"
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "At least one audio file or URL is required",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Audio lesson not found",
  "error": "Not Found"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Supported Audio Formats
- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- AAC (.aac)
- OGG (.ogg)
- WebM (.webm)
- FLAC (.flac)

## File Size Limits
- Maximum file size: 500MB per audio file
- Recommended: Keep files under 100MB for better performance

## Best Practices

### Creating Audio Lessons
1. Always provide a descriptive title
2. Include both English and Hindi content when possible
3. Provide all 4 transcription types for better accessibility
4. Use meaningful section titles and accurate timestamps
5. Add relevant tags for better searchability

### Updating Audio Lessons
1. Update transcriptions when audio files are changed
2. Maintain section accuracy with new content
3. Update tags to reflect content changes
4. Test audio quality before uploading

### File Management
1. Use descriptive filenames
2. Compress audio files appropriately
3. Ensure good audio quality
4. Keep backup copies of original files

This CRUD API provides complete control over audio lesson management with support for dual languages, rich transcriptions, and structured content sections.