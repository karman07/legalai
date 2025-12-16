# Quiz Types (PYQ vs Mocktest)

This update adds a `type` to each quiz and enables filtering.

- Field on quiz: `type` (required) — one of `pyq` or `mocktest`
- Affects list endpoints: pass `type` to fetch specific kind

## Admin
- Create Quiz: include `type: "pyq" | "mocktest"` in body
- List Quizzes: `GET /api/admin/quizzes?type=pyq`

## User
- List Quizzes: `GET /api/quizzes?type=mocktest`
- Get/Submit remain the same (no `type` needed in path)

## Example Create (Admin)
```json
{
  "title": "IPC Basics Quiz",
  "topic": "IPC",
  "type": "pyq",
  "isPublished": true,
  "questions": [
    {"text": "Section 420 deals with?", "options": ["Forgery","Cheating","Theft","Assault"], "correctOptionIndex": 1}
  ]
}
```

## Notes
- Only published quizzes appear in user endpoints.
- `type` is indexed for fast filtering.
