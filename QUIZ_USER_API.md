# Quiz User API

Base URL: `http://localhost:3000/api`

Auth: All endpoints require a valid JWT in the `Authorization` header.
```
Authorization: Bearer YOUR_USER_TOKEN
```

---

## List Published Quizzes
- Endpoint: `GET /quizzes`
- Query params:
  - `topic` (optional, string): filter by topic (case-insensitive exact match)
  - `page` (optional, number): default `1`
  - `limit` (optional, number): default `10`
- Returns: paginated quizzes with questions sanitized (no correct answers)

cURL:
```bash
curl -X GET "http://localhost:3000/api/quizzes?topic=IPC&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

Sample Response:
```json
{
  "items": [
    {
      "_id": "6730f5c3b3f4b0e8c1a2d9a1",
      "title": "IPC Basics Quiz",
      "topic": "IPC",
      "description": "Intro IPC sections",
      "isPublished": true,
      "questions": [
        {"text": "Section 420 deals with?", "options": ["Forgery","Cheating","Theft","Assault"], "explanation": "Cheating is covered under 420"},
        {"text": "IPC enacted in?", "options": ["1860","1947","1950","1972"], "explanation": "IPC came into force in 1862"}
      ],
      "createdAt": "2025-12-08T08:10:00.000Z",
      "updatedAt": "2025-12-08T08:10:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## Get a Published Quiz
- Endpoint: `GET /quizzes/:id`
- Path params:
  - `id` (string): quiz id
- Returns: the quiz object sanitized (no correct answers)

cURL:
```bash
curl -X GET "http://localhost:3000/api/quizzes/QUIZ_ID" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

Sample Response:
```json
{
  "_id": "6730f5c3b3f4b0e8c1a2d9a1",
  "title": "IPC Basics Quiz",
  "topic": "IPC",
  "description": "Intro IPC sections",
  "isPublished": true,
  "questions": [
    {"text": "Section 420 deals with?", "options": ["Forgery","Cheating","Theft","Assault"], "explanation": "Cheating is covered under 420"},
    {"text": "IPC enacted in?", "options": ["1860","1947","1950","1972"], "explanation": "IPC came into force in 1862"}
  ],
  "createdAt": "2025-12-08T08:10:00.000Z",
  "updatedAt": "2025-12-08T08:10:00.000Z"
}
```

---

## Submit Answers
- Endpoint: `POST /quizzes/:id/submit`
- Path params:
  - `id` (string): quiz id
- Body: array of selected option indices, one per question
  - `answers` must match the number of questions

Request Body:
```json
{
  "answers": [1, 0]
}
```

cURL:
```bash
curl -X POST "http://localhost:3000/api/quizzes/QUIZ_ID/submit" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers":[1,0]}'
```

Sample Response:
```json
{
  "quizId": "6730f5c3b3f4b0e8c1a2d9a1",
  "totalQuestions": 2,
  "score": 2,
  "percentage": 100,
  "details": [
    {
      "question": "Section 420 deals with?",
      "selectedIndex": 1,
      "correctIndex": 1,
      "correct": true,
      "explanation": "Cheating is covered under 420"
    },
    {
      "question": "IPC enacted in?",
      "selectedIndex": 0,
      "correctIndex": 0,
      "correct": true,
      "explanation": "IPC came into force in 1862"
    }
  ]
}
```

---

## Errors
- 401 Unauthorized: missing/invalid token
- 404 Not Found: quiz not found or not published
- 400 Bad Request: answers array length mismatch or invalid indices

---

## Quick Frontend Tips
- Always fetch with `Authorization: Bearer <token>`.
- Use the list endpoint first to get `QUIZ_ID`, then fetch details, then submit answers.
- The quiz returned to users does not include the correct answers; they are only visible in the submit response for evaluation.
