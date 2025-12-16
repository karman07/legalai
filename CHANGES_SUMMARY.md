# Changes Summary (Quizzes + AI)

## Quiz Type (Public)
- Added `type` field to quizzes: `"pyq" | "mocktest"` (indexed)
- Both Admin and User list endpoints accept `type` filter:
  - Admin: `GET /api/admin/quizzes?type=pyq|mocktest&topic=&page=&limit=`
  - User: `GET /api/quizzes?type=pyq|mocktest&topic=&page=&limit=`
- Create/Update include `type`:
  - Create (admin body): `{ title, topic, type, isPublished, questions[] }`
  - Update (admin body): optional `{ title, topic, type, isPublished, questions[] }`

## User Quiz APIs (unchanged behavior)
- User `GET /api/quizzes` and `GET /api/quizzes/:id` return sanitized questions (no correct indices).
- User `POST /api/quizzes/:id/submit` scores responses and returns details.

## AI Generation Module
- Endpoint (JWT required): `POST /api/ai/quizzes/generate`
- Body: `{ "topic": string, "count": number (1-50) }`
- Returns a quiz-shaped object:
  - `{ title, topic, type: "mocktest", isPublished: false, questions[] }`
- Uses Gemini API (`GEMINI_MODEL`, `GEMINI_API_KEY` from `.env`).

## Env Vars
- `.env` additions:
  - `GEMINI_API_KEY=...`
  - `GEMINI_MODEL=gemini-2.0-flash`

## Quick Examples
- List user quizzes by type:
  - `GET /api/quizzes?type=pyq&page=1&limit=10`
- List admin quizzes by type:
  - `GET /api/admin/quizzes?type=mocktest&page=1&limit=10`
- AI generate:
  - `POST /api/ai/quizzes/generate` with `{ "topic": "IPC", "count": 10 }`

## Notes
- Only published quizzes appear in user endpoints.
- AI response is validated to ensure 4 options per question and a valid correct index.
