# Audio Lessons API - User Routes

Base URL: `/api/audio-lessons`

All routes require JWT authentication.

---

## Routes

### 1. List Audio Lessons
```
GET /api/audio-lessons
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 12) - Items per page
- `category` (optional) - Filter by category ID (constitution, ipc, bns, etc.)
- `search` (optional) - Search in title, description, transcript, and tags

**Response:**
```json
{
  "items": [
    {
      "_id": "...",
      "title": "Constitutional Law Lecture 1",
      "description": "Introduction to constitutional law",
      "audioUrl": "/uploads/audio/audio-123.wav",
      "fileName": "audio-123.wav",
      "fileSize": 12345678,
      "duration": 3600,
      "transcript": "...",
      "category": "constitution",
      "tags": ["constitutional law", "basic structure"],
      "language": "en",
      "isActive": true,
      "transcriptionStatus": "completed",
      "createdAt": "2025-12-15T10:00:00.000Z",
      "updatedAt": "2025-12-15T10:30:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 12,
  "totalPages": 5
}
```

---

### 2. Get Categories with Count
```
GET /api/audio-lessons/categories
```

**Response:**
```json
[
  {
    "id": "constitution",
    "name": "Constitution of India",
    "description": "Fundamental law of India",
    "sections": 470,
    "count": 5
  },
  {
    "id": "ipc",
    "name": "Indian Penal Code (IPC)",
    "description": "Criminal offenses and punishments",
    "sections": 511,
    "count": 3
  },
  {
    "id": "bns",
    "name": "Bharatiya Nyaya Sanhita (BNS)",
    "description": "New criminal code replacing IPC",
    "sections": 358,
    "count": 2
  }
]
```

---

### 3. Get All Categories
```
GET /api/audio-lessons/categories/all
```

**Response:**
```json
[
  {
    "id": "constitution",
    "name": "Constitution of India",
    "description": "Fundamental law of India",
    "sections": 470,
    "count": 0,
    "isUsed": true
  },
  {
    "id": "ipc",
    "name": "Indian Penal Code (IPC)",
    "description": "Criminal offenses and punishments",
    "sections": 511,
    "count": 0,
    "isUsed": false
  }
]
```

---

### 4. Search Audio Lessons
```
GET /api/audio-lessons/search
```

**Query Parameters:**
- `q` (required) - Search query
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 12) - Items per page

**Response:**
```json
{
  "items": [...],
  "total": 10,
  "page": 1,
  "limit": 12,
  "totalPages": 1
}
```

---

### 5. Filter by Category
```
GET /api/audio-lessons/category/:category
```

**Path Parameters:**
- `category` - Category ID (constitution, ipc, bns, crpc, bnss, iea, bse, cpc, contract, companies)

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 12) - Items per page

**Example:**
```
GET /api/audio-lessons/category/constitution?page=1&limit=12
```

**Response:**
```json
{
  "items": [...],
  "total": 5,
  "page": 1,
  "limit": 12,
  "totalPages": 1
}
```

---

### 6. Get Audio Lesson by ID
```
GET /api/audio-lessons/:id
```

**Path Parameters:**
- `id` - Audio lesson ID

**Response:**
```json
{
  "_id": "67591234567890abcdef1234",
  "title": "Constitutional Law Lecture 1",
  "description": "Introduction to constitutional law and basic structure doctrine",
  "audioUrl": "/uploads/audio/audio-1765795701662-377242525.wav",
  "fileName": "audio-1765795701662-377242525.wav",
  "fileSize": 12345678,
  "duration": 2580,
  "transcript": "Full transcription text here...",
  "category": "constitution",
  "tags": ["constitutional law", "basic structure", "fundamental rights"],
  "language": "en",
  "uploadedBy": "67591234567890abcdef5678",
  "isActive": true,
  "transcriptionStatus": "completed",
  "transcriptionError": null,
  "createdAt": "2025-12-15T10:00:00.000Z",
  "updatedAt": "2025-12-15T10:30:00.000Z"
}
```

---

## Available Categories

| ID | Name | Sections |
|---|---|---|
| `constitution` | Constitution of India | 470 |
| `ipc` | Indian Penal Code (IPC) | 511 |
| `bns` | Bharatiya Nyaya Sanhita (BNS) | 358 |
| `crpc` | Code of Criminal Procedure (CrPC) | 484 |
| `bnss` | Bharatiya Nagarik Suraksha Sanhita (BNSS) | 531 |
| `iea` | Indian Evidence Act | 167 |
| `bse` | Bharatiya Sakshya Adhiniyam (BSE) | 170 |
| `cpc` | Civil Procedure Code (CPC) | 158 |
| `contract` | Indian Contract Act | 238 |
| `companies` | Companies Act | 470 |

---

## Transcription Status Values

- `pending` - Transcription queued
- `processing` - Currently transcribing
- `completed` - Transcription successful
- `failed` - Transcription failed

---

## Authentication

All routes require Bearer token authentication:

```
Authorization: Bearer <your_jwt_token>
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Audio lesson not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid audio lesson id"
}
```
