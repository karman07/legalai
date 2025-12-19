# Notes API Documentation

## Overview
Generic notes system that can reference any module (PDF, Audio, Quiz, etc.) with user-specific access control.

## Schema Structure

```json
{
  "_id": "ObjectId",
  "title": "string (required)",
  "content": "string (required)",
  "reference": {
    "type": "string (required)", // 'pdf', 'audio', 'quiz', etc.
    "id": "string (required)",   // ID of referenced resource
    "metadata": {                // Optional context data
      "page": 5,                 // For PDFs
      "timestamp": 120,          // For audio/video (seconds)
      "question": 3              // For quizzes
    }
  },
  "userId": "ObjectId (required)",
  "tags": ["string"],
  "isBookmarked": "boolean (default: false)",
  "isFavourite": "boolean (default: false)",
  "isActive": "boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## API Endpoints

### Create Note
**POST** `/api/notes`

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important Legal Point",
    "content": "This section explains the fundamental rights under Article 14...",
    "reference": {
      "type": "pdf",
      "id": "65f1234567890abcdef12345",
      "metadata": {
        "page": 15,
        "section": "Fundamental Rights"
      }
    },
    "tags": ["constitutional-law", "fundamental-rights"],
    "isBookmarked": true,
    "isFavourite": false
  }'
```

### Get All Notes (with filters)
**GET** `/api/notes`

```bash
# Get all notes
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes"

# Get notes with pagination
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes?page=1&limit=10"

# Get notes for specific PDF
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes?referenceType=pdf&referenceId=65f1234567890abcdef12345"

# Get notes for specific audio lesson
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes?referenceType=audio&referenceId=65f1234567890abcdef12345"

# Get bookmarked notes only
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes?isBookmarked=true"

# Get favourite notes only
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes?isFavourite=true"

# Get notes by tags
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes?tags=constitutional-law,fundamental-rights"
```

### Get Notes by Reference
**GET** `/api/notes/reference/:type/:id`

```bash
# Get all notes for a specific PDF
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes/reference/pdf/65f1234567890abcdef12345"

# Get all notes for a specific audio lesson
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes/reference/audio/65f1234567890abcdef12345"

# Get all notes for a specific quiz
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes/reference/quiz/65f1234567890abcdef12345"
```

### Get Single Note
**GET** `/api/notes/:id`

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes/65f1234567890abcdef12345"
```

### Update Note
**PUT** `/api/notes/:id`

```bash
curl -X PUT http://localhost:3000/api/notes/65f1234567890abcdef12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Legal Point",
    "content": "Updated explanation of fundamental rights...",
    "tags": ["constitutional-law", "updated"]
  }'
```

### Toggle Bookmark
**PUT** `/api/notes/:id/bookmark`

```bash
curl -X PUT http://localhost:3000/api/notes/65f1234567890abcdef12345/bookmark \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Toggle Favourite
**PUT** `/api/notes/:id/favourite`

```bash
curl -X PUT http://localhost:3000/api/notes/65f1234567890abcdef12345/favourite \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Toggle Response Format
```json
{
  "message": "Note bookmarked",
  "isBookmarked": true
}
```

```json
{
  "message": "Note added to favourites",
  "isFavourite": true
}
```

### Get Bookmarked Notes
**GET** `/api/notes/bookmarked`

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes/bookmarked"
```

### Get Favourite Notes
**GET** `/api/notes/favourites`

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes/favourites"
```

### Get All Tags
**GET** `/api/notes/tags`

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/notes/tags"
```

### Delete Note (Soft Delete)
**DELETE** `/api/notes/:id`

```bash
curl -X DELETE http://localhost:3000/api/notes/65f1234567890abcdef12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Usage Examples

### 1. PDF Reading Notes
```json
{
  "title": "Key Point on Page 25",
  "content": "The Supreme Court ruling in this case established...",
  "reference": {
    "type": "pdf",
    "id": "pdf_document_id",
    "metadata": {
      "page": 25,
      "chapter": "Constitutional Law",
      "highlight": "yellow"
    }
  },
  "tags": ["supreme-court", "constitutional-law"]
}
```

### 2. Audio Lesson Notes
```json
{
  "title": "Important Concept at 5:30",
  "content": "The speaker explains the difference between...",
  "reference": {
    "type": "audio",
    "id": "audio_lesson_id",
    "metadata": {
      "timestamp": 330,
      "section": "Introduction",
      "language": "english"
    }
  },
  "tags": ["audio-notes", "concepts"]
}
```

### 3. Quiz Notes
```json
{
  "title": "Tricky Question Explanation",
  "content": "Remember: Article 21 covers right to life and personal liberty...",
  "reference": {
    "type": "quiz",
    "id": "quiz_id",
    "metadata": {
      "question": 5,
      "difficulty": "hard",
      "topic": "fundamental-rights"
    }
  },
  "tags": ["quiz-help", "article-21"]
}
```

### 4. Video Notes
```json
{
  "title": "Professor's Key Point",
  "content": "At 15:45, the professor emphasizes that...",
  "reference": {
    "type": "video",
    "id": "video_id",
    "metadata": {
      "timestamp": 945,
      "chapter": "Criminal Law Basics"
    }
  },
  "tags": ["video-notes", "criminal-law"]
}
```

## Response Formats

### Single Note Response
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Important Legal Point",
  "content": "This section explains...",
  "reference": {
    "type": "pdf",
    "id": "65f1234567890abcdef12345",
    "metadata": {
      "page": 15
    }
  },
  "userId": "65f0987654321abcdef09876",
  "tags": ["constitutional-law"],
  "isBookmarked": true,
  "isFavourite": false,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Paginated Notes Response
```json
{
  "items": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Note 1",
      "content": "Content 1...",
      "reference": {
        "type": "pdf",
        "id": "pdf_id"
      },
      "tags": ["tag1"],
      "isBookmarked": false,
      "isFavourite": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### Tags Response
```json
[
  "constitutional-law",
  "fundamental-rights",
  "criminal-law",
  "audio-notes",
  "quiz-help"
]
```

## Reference Types

### Supported Reference Types
- `pdf` - PDF documents
- `audio` - Audio lessons
- `quiz` - Quiz questions
- `video` - Video lessons
- `article` - Articles/blogs
- `book` - Book chapters
- `case` - Legal cases
- `statute` - Legal statutes

### Metadata Examples by Type

**PDF:**
```json
{
  "page": 15,
  "chapter": "Chapter Name",
  "section": "Section Name",
  "highlight": "yellow",
  "annotation": "important"
}
```

**Audio:**
```json
{
  "timestamp": 330,
  "section": "Introduction",
  "language": "english",
  "speaker": "Professor Name"
}
```

**Quiz:**
```json
{
  "question": 5,
  "difficulty": "hard",
  "topic": "fundamental-rights",
  "correct": true
}
```

**Video:**
```json
{
  "timestamp": 945,
  "chapter": "Chapter Name",
  "quality": "720p",
  "speed": "1.5x"
}
```

## Security Features

- **User Isolation**: Users can only access their own notes
- **JWT Authentication**: All endpoints require valid JWT token
- **Soft Delete**: Notes are marked as inactive, not permanently deleted
- **Input Validation**: All inputs are validated using class-validator

## Performance Features

- **Indexed Queries**: Optimized database indexes for fast retrieval
- **Pagination**: All list endpoints support pagination
- **Filtering**: Multiple filter options for efficient searching
- **Lean Queries**: Optimized MongoDB queries for better performance

This generic notes system can be extended to support any new module types by simply adding new reference types and metadata structures.