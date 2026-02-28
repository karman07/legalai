# Search API Documentation

This API provides global search functionality across multiple modules.

## Unified Global Search
Search across PDFs, Audio Lessons, and Quizzes with a single query.

### Endpoint
`GET /api/search?q={query}&limit={limit}`

### Auth
Required: **JWT Token** (Authorization Header)

### CURL Examples

#### 1. Simple Keyword Search
```bash
curl -X GET "http://localhost:3000/api/search?q=supreme" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2. Search with Limit
```bash
curl -X GET "http://localhost:3000/api/search?q=legal&limit=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3. Search for Specific Case or Title
```bash
curl -X GET "http://localhost:3000/api/search?q=Case-2024" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## PDF Dedicated Search
(Existing endpoint in PdfsController)

### Endpoint
`GET /api/pdfs/search?q={query}`

### CURL Example
```bash
curl -X GET "http://localhost:3000/api/pdfs/search?q=high+court" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Audio Lessons Dedicated Search
(Existing endpoint in AudioLessonsController)

### Endpoint
`GET /api/audio-lessons/search?q={query}`

### CURL Example
```bash
curl -X GET "http://localhost:3000/api/audio-lessons/search?q=criminal+law" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
