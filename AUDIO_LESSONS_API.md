# Audio Lessons API Documentation

Base URL: `http://localhost:3000/api`

## Features
- ✅ Upload audio files (MP3, WAV, M4A, AAC, OGG, WEBM, FLAC)
- ✅ Support for large files (up to 500MB)
- ✅ Automatic audio-to-text transcription using OpenAI Whisper API
- ✅ Admin CRUD operations
- ✅ User search and filtering
- ✅ Category management

---

## Admin Endpoints

### Upload Audio Lesson
**Endpoint:** `POST /admin/audio-lessons`

**Auth:** Admin JWT token required

**Form Data:**
- `file` (required): Audio file (MP3, WAV, M4A, AAC, OGG, WEBM, FLAC)
- `title` (required): Lesson title
- `description` (optional): Lesson description
- `category` (optional): Category name
- `tags` (optional): JSON array of tags `["tag1","tag2"]`
- `language` (optional): Language code (e.g., 'en', 'hi')
- `duration` (optional): Duration in seconds

**Example:**
```bash
curl -X POST "http://localhost:3000/api/admin/audio-lessons" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@/path/to/lesson.mp3" \
  -F "title=Constitutional Law Lecture 1" \
  -F "description=Introduction to constitutional law" \
  -F "category=Constitutional Law" \
  -F "tags=[\"constitutional law\",\"introduction\",\"basics\"]" \
  -F "language=en" \
  -F "duration=3600"
```

**Response:**
```json
{
  "_id": "674d8e9a1b2c3d4e5f6a7b8c",
  "title": "Constitutional Law Lecture 1",
  "description": "Introduction to constitutional law",
  "audioUrl": "/uploads/audio/audio-1702561234567-123456789.mp3",
  "fileName": "lesson.mp3",
  "fileSize": 52428800,
  "duration": 3600,
  "category": "Constitutional Law",
  "tags": ["constitutional law", "introduction", "basics"],
  "language": "en",
  "transcriptionStatus": "pending",
  "uploadedBy": "507f1f77bcf86cd799439010",
  "isActive": true,
  "createdAt": "2025-12-15T10:30:00.000Z",
  "updatedAt": "2025-12-15T10:30:00.000Z"
}
```

**Note:** Transcription starts automatically in the background after upload.

---

### List All Audio Lessons (Admin)
**Endpoint:** `GET /admin/audio-lessons`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `isActive` (optional): Filter by active status
- `category` (optional): Filter by category

**Example:**
```bash
curl -X GET "http://localhost:3000/api/admin/audio-lessons?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Get Audio Lesson by ID (Admin)
**Endpoint:** `GET /admin/audio-lessons/:id`

**Example:**
```bash
curl -X GET "http://localhost:3000/api/admin/audio-lessons/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response includes transcript:**
```json
{
  "_id": "674d8e9a1b2c3d4e5f6a7b8c",
  "title": "Constitutional Law Lecture 1",
  "audioUrl": "/uploads/audio/audio-1702561234567-123456789.mp3",
  "transcript": "Welcome to constitutional law. Today we will discuss the basic structure doctrine...",
  "transcriptionStatus": "completed",
  ...
}
```

---

### Get Categories
**Endpoint:** `GET /admin/audio-lessons/categories`

**Example:**
```bash
curl -X GET "http://localhost:3000/api/admin/audio-lessons/categories" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
["Constitutional Law", "Criminal Law", "Civil Law"]
```

---

### Update Audio Lesson
**Endpoint:** `PUT /admin/audio-lessons/:id`

**Form Data:**
- `file` (optional): New audio file to replace existing
- `title` (optional): Updated title
- `description` (optional): Updated description
- `category` (optional): Updated category
- `tags` (optional): Updated tags as JSON array
- `isActive` (optional): Active status

**Example - Update metadata:**
```bash
curl -X PUT "http://localhost:3000/api/admin/audio-lessons/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "title=Updated Constitutional Law Lecture" \
  -F "description=Revised content"
```

**Example - Replace audio file:**
```bash
curl -X PUT "http://localhost:3000/api/admin/audio-lessons/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@/path/to/new-lesson.mp3"
```

**Note:** Replacing audio file triggers re-transcription.

---

### Retry Transcription
**Endpoint:** `POST /admin/audio-lessons/:id/retry-transcription`

**Description:** Manually retry transcription if it failed

**Example:**
```bash
curl -X POST "http://localhost:3000/api/admin/audio-lessons/674d8e9a1b2c3d4e5f6a7b8c/retry-transcription" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Delete Audio Lesson
**Endpoint:** `DELETE /admin/audio-lessons/:id`

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/admin/audio-lessons/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## User Endpoints

### List Audio Lessons (User)
**Endpoint:** `GET /audio-lessons`

**Auth:** User JWT token required

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 12)
- `category` (optional): Filter by category
- `search` (optional): Search in title, description, transcript, tags

**Example:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons?page=1&limit=12&category=Constitutional%20Law" \
  -H "Authorization: Bearer USER_TOKEN"
```

---

### Search Audio Lessons
**Endpoint:** `GET /audio-lessons/search`

**Query Parameters:**
- `q` (required): Search query
- `page` (optional, default: 1)
- `limit` (optional, default: 12)

**Example:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons/search?q=fundamental%20rights" \
  -H "Authorization: Bearer USER_TOKEN"
```

**Note:** Searches across title, description, transcript, and tags.

---

### Get Categories (User)
**Endpoint:** `GET /audio-lessons/categories`

**Example:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons/categories" \
  -H "Authorization: Bearer USER_TOKEN"
```

---

### Filter by Category
**Endpoint:** `GET /audio-lessons/category/:category`

**Example:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons/category/Constitutional%20Law?page=1&limit=12" \
  -H "Authorization: Bearer USER_TOKEN"
```

---

### Get Audio Lesson by ID (User)
**Endpoint:** `GET /audio-lessons/:id`

**Example:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## Audio-to-Text Transcription

### How It Works:
1. Admin uploads audio file
2. File is saved to `./uploads/audio/`
3. Background process automatically sends audio to OpenAI Whisper API
4. Transcription is stored in `transcript` field
5. Status tracked via `transcriptionStatus` field

### Transcription Status:
- `pending`: Transcription queued
- `processing`: Currently transcribing
- `completed`: Transcription successful
- `failed`: Transcription failed (check `transcriptionError`)

### Setup OpenAI API:
Add to `.env`:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Get API Key:** https://platform.openai.com/api-keys

### Supported Audio Formats:
- MP3 (audio/mpeg)
- WAV (audio/wav)
- M4A (audio/m4a)
- AAC (audio/aac)
- OGG (audio/ogg)
- WEBM (audio/webm)
- FLAC (audio/flac)

### Transcription Features:
- ✅ Automatic background processing
- ✅ Non-blocking (upload completes immediately)
- ✅ Supports multiple languages
- ✅ High accuracy with Whisper AI
- ✅ Retry mechanism for failed transcriptions
- ✅ Error tracking and logging

---

## File Storage

- **Directory:** `./uploads/audio/`
- **Max Size:** 500MB per file
- **Access URL:** `http://localhost:3000/uploads/audio/filename.mp3`
- **Public Access:** Files are publicly accessible (no auth required to download)

---

## Error Responses

### 400 Bad Request - No file
```json
{
  "statusCode": 400,
  "message": "Audio file is required",
  "error": "Bad Request"
}
```

### 400 Bad Request - Invalid file type
```json
{
  "statusCode": 400,
  "message": "Only audio files are allowed",
  "error": "Bad Request"
}
```

### 413 Payload Too Large
```json
{
  "statusCode": 413,
  "message": "File too large",
  "error": "Payload Too Large"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Audio lesson not found"
}
```

---

## Frontend Integration

### React Upload Example:
```javascript
async function uploadAudioLesson(file, metadata, adminToken) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', metadata.title);
  formData.append('description', metadata.description);
  formData.append('category', metadata.category);
  formData.append('tags', JSON.stringify(metadata.tags));

  const response = await fetch('http://localhost:3000/api/admin/audio-lessons', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: formData,
  });

  return await response.json();
}
```

### Display Transcript:
```javascript
function AudioLessonPlayer({ lesson }) {
  return (
    <div>
      <h3>{lesson.title}</h3>
      <audio controls src={`http://localhost:3000${lesson.audioUrl}`} />
      
      {lesson.transcriptionStatus === 'completed' && (
        <div className="transcript">
          <h4>Transcript:</h4>
          <p>{lesson.transcript}</p>
        </div>
      )}
      
      {lesson.transcriptionStatus === 'processing' && (
        <p>Transcription in progress...</p>
      )}
      
      {lesson.transcriptionStatus === 'failed' && (
        <p>Transcription failed: {lesson.transcriptionError}</p>
      )}
    </div>
  );
}
```

---

## Important Notes

1. **OpenAI API Key Required:**
   - Transcription requires `OPENAI_API_KEY` in `.env`
   - Without API key, files upload but transcription is skipped

2. **Large File Support:**
   - 500MB limit allows for long lectures (8-10 hours of MP3)
   - Transcription time depends on audio length

3. **Background Processing:**
   - Transcription doesn't block upload response
   - Check `transcriptionStatus` field for progress

4. **Cost Considerations:**
   - OpenAI Whisper API charges $0.006 per minute of audio
   - 1 hour of audio ≈ $0.36

5. **Production Recommendations:**
   - Use cloud storage (S3) for audio files
   - Implement queue system (Bull, RabbitMQ) for transcription
   - Add webhook notifications when transcription completes
   - Cache transcripts in CDN

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (no file, invalid format) |
| 401 | Unauthorized |
| 403 | Forbidden (not admin) |
| 404 | Not Found |
| 413 | Payload Too Large (> 500MB) |
| 500 | Internal Server Error |
