# User API Routes

All routes require JWT authentication unless specified otherwise.

## Authentication Routes (`/api/auth`)

### POST `/api/auth/register`
Register a new user account
```json
Response: {
  "user": { "id": "...", "email": "...", "name": "...", "role": "user" },
  "access_token": "jwt_token"
}
```

### POST `/api/auth/login`
Login with email and password
```json
Response: {
  "user": { "id": "...", "email": "...", "name": "...", "role": "user" },
  "access_token": "jwt_token"
}
```

### POST `/api/auth/google-signin`
Sign in with Google OAuth
```json
Response: {
  "user": { "id": "...", "email": "...", "name": "...", "role": "user" },
  "access_token": "jwt_token"
}
```

### GET `/api/auth/profile`
Get current user profile
```json
Response: {
  "id": "...",
  "email": "...",
  "name": "...",
  "role": "user",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## Audio Lessons Routes (`/api/audio-lessons`)

### GET `/api/audio-lessons`
List all audio lessons with pagination and filters
```
Query Params: ?page=1&limit=12&category=constitution&search=term
```
```json
Response: {
  "items": [...],
  "total": 50,
  "page": 1,
  "limit": 12,
  "totalPages": 5
}
```

### GET `/api/audio-lessons/categories`
Get all categories with lesson counts
```json
Response: [
  {
    "id": "constitution",
    "name": "Constitution of India",
    "description": "Fundamental law of India",
    "sections": 470,
    "count": 5
  },
  ...
]
```

### GET `/api/audio-lessons/categories/all`
Get all available categories (without counts)
```json
Response: [
  {
    "id": "constitution",
    "name": "Constitution of India",
    "description": "Fundamental law of India",
    "sections": 470,
    "count": 0,
    "isUsed": true
  },
  ...
]
```

### GET `/api/audio-lessons/search`
Search audio lessons
```
Query Params: ?q=searchterm&page=1&limit=12
```
```json
Response: {
  "items": [...],
  "total": 10,
  "page": 1,
  "limit": 12,
  "totalPages": 1
}
```

### GET `/api/audio-lessons/category/:category`
Get lessons by category ID
```
Example: /api/audio-lessons/category/constitution?page=1&limit=12
```
```json
Response: {
  "items": [...],
  "total": 5,
  "page": 1,
  "limit": 12,
  "totalPages": 1
}
```

### GET `/api/audio-lessons/:id`
Get single audio lesson by ID
```json
Response: {
  "_id": "...",
  "title": "Constitutional Law Lecture",
  "description": "...",
  "audioUrl": "/uploads/audio/...",
  "fileName": "...",
  "fileSize": 12345678,
  "duration": 3600,
  "transcript": "...",
  "category": "constitution",
  "tags": ["..."],
  "language": "en",
  "isActive": true,
  "transcriptionStatus": "completed",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## PDF Routes (`/api/pdfs`)

### GET `/api/pdfs`
List all PDFs with pagination and filters
```
Query Params: ?page=1&limit=12&category=...&year=2023&courtLevel=supreme&search=term
```
```json
Response: {
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 12,
  "totalPages": 9
}
```

### GET `/api/pdfs/categories`
Get all PDF categories
```json
Response: ["Constitutional Law", "Criminal Law", "Civil Procedure", ...]
```

### GET `/api/pdfs/search`
Search PDFs
```
Query Params: ?q=searchterm&page=1&limit=12
```
```json
Response: {
  "items": [...],
  "total": 20,
  "page": 1,
  "limit": 12,
  "totalPages": 2
}
```

### GET `/api/pdfs/category/:category`
Get PDFs by category
```
Example: /api/pdfs/category/Constitutional%20Law?page=1&limit=12
```
```json
Response: {
  "items": [...],
  "total": 15,
  "page": 1,
  "limit": 12,
  "totalPages": 2
}
```

### GET `/api/pdfs/court/:level`
Get PDFs by court level
```
Example: /api/pdfs/court/supreme?page=1&limit=12
Values: supreme, high, district
```
```json
Response: {
  "items": [...],
  "total": 30,
  "page": 1,
  "limit": 12,
  "totalPages": 3
}
```

### GET `/api/pdfs/year/:year`
Get PDFs by year
```
Example: /api/pdfs/year/2023?page=1&limit=12
```
```json
Response: {
  "items": [...],
  "total": 25,
  "page": 1,
  "limit": 12,
  "totalPages": 3
}
```

### GET `/api/pdfs/:id`
Get single PDF by ID
```json
Response: {
  "_id": "...",
  "title": "...",
  "description": "...",
  "fileUrl": "/uploads/pdfs/...",
  "fileName": "...",
  "fileSize": 1234567,
  "category": "...",
  "caseTitle": "...",
  "caseNumber": "...",
  "year": 2023,
  "court": {
    "id": "...",
    "name": "Supreme Court of India",
    "level": "supreme",
    "state": null
  },
  "keywords": ["..."],
  "summary": "...",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## Quiz Routes (`/api/quizzes`)

### GET `/api/quizzes`
List all published quizzes
```
Query Params: ?page=1&limit=10&topic=...&type=pyq|mocktest
```
```json
Response: {
  "items": [
    {
      "_id": "...",
      "title": "...",
      "description": "...",
      "topic": "...",
      "type": "pyq",
      "totalQuestions": 50,
      "isPublished": true,
      "createdAt": "..."
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

### GET `/api/quizzes/:id`
Get quiz details (without correct answers)
```json
Response: {
  "_id": "...",
  "title": "...",
  "description": "...",
  "topic": "...",
  "type": "pyq",
  "questions": [
    {
      "text": "Question text?",
      "options": ["A", "B", "C", "D"],
      "explanation": "..."
    }
  ]
}
```

### POST `/api/quizzes/:id/submit`
Submit quiz answers for scoring
```json
Request Body: {
  "answers": [0, 2, 1, 3, ...]
}

Response: {
  "totalQuestions": 50,
  "score": 35,
  "percentage": 70,
  "details": [
    {
      "question": "...",
      "selectedIndex": 0,
      "correctIndex": 0,
      "correct": true,
      "explanation": "..."
    },
    ...
  ]
}
```

---

## AI Quiz Routes (`/api/ai/quizzes`)

### POST `/api/ai/quizzes/generate`
Generate AI quiz on any topic
```json
Request Body: {
  "topic": "Fundamental Rights",
  "count": 10
}

Response: {
  "title": "Fundamental Rights - AI Generated",
  "topic": "Fundamental Rights",
  "type": "mocktest",
  "isPublished": false,
  "questions": [
    {
      "text": "...",
      "options": ["A", "B", "C", "D"],
      "correctOptionIndex": 2,
      "explanation": "..."
    },
    ...
  ]
}
```

### POST `/api/ai/quizzes/score`
Score AI-generated quiz
```json
Request Body: {
  "questions": [...],
  "answers": [0, 2, 1, 3, ...]
}

Response: {
  "totalQuestions": 10,
  "score": 7,
  "percentage": 70,
  "details": [...]
}
```

---

## Root Route

### GET `/`
Health check / Welcome message
```json
Response: "Hello World!"
```

---

## Common Response Patterns

### Success Response
```json
{
  "data": {...},
  "message": "Success"
}
```

### Pagination Response
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 12,
  "totalPages": 9
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

---

## Notes

1. All routes except `/api/auth/register`, `/api/auth/login`, `/api/auth/google-signin`, and `/` require JWT authentication
2. Include `Authorization: Bearer <token>` header for authenticated routes
3. All list endpoints support pagination with `page` and `limit` query parameters
4. Search is case-insensitive and searches across multiple fields
5. Only active content (`isActive: true`) is returned to users
6. Category IDs for audio lessons: `constitution`, `ipc`, `bns`, `crpc`, `bnss`, `iea`, `bse`, `cpc`, `contract`, `companies`
