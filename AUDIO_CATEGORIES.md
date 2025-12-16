# Audio Lesson Categories

## Overview
Audio lessons now use a predefined set of legal categories with validation.

## Available Categories

| ID | Name | Description | Sections |
|---|---|---|---|
| `constitution` | Constitution of India | Fundamental law of India | 470 |
| `ipc` | Indian Penal Code (IPC) | Criminal offenses and punishments | 511 |
| `bns` | Bharatiya Nyaya Sanhita (BNS) | New criminal code replacing IPC | 358 |
| `crpc` | Code of Criminal Procedure (CrPC) | Criminal procedure code | 484 |
| `bnss` | Bharatiya Nagarik Suraksha Sanhita (BNSS) | New criminal procedure code | 531 |
| `iea` | Indian Evidence Act | Law of evidence | 167 |
| `bse` | Bharatiya Sakshya Adhiniyam (BSE) | New evidence law | 170 |
| `cpc` | Civil Procedure Code (CPC) | Civil court procedures | 158 |
| `contract` | Indian Contract Act | Law of contracts | 238 |
| `companies` | Companies Act | Corporate law | 470 |

## API Endpoints

### Get All Categories
```
GET /api/audio-lessons/categories
GET /api/admin/audio-lessons/categories
```
Returns categories with lesson count for each.

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
  ...
]
```

### Get Categories List (Without Count)
```
GET /api/audio-lessons/categories/all
GET /api/admin/audio-lessons/categories/all
```
Returns all available categories.

### Filter by Category
```
GET /api/audio-lessons/category/:categoryId
GET /api/audio-lessons?category=constitution
```

## Usage Examples

### Creating Audio Lesson with Category
```javascript
// In form-data
{
  "file": <audio file>,
  "title": "Introduction to Constitutional Law",
  "category": "constitution",  // Use category ID
  "description": "Basic principles",
  "tags": ["fundamental rights", "directive principles"]
}
```

### Updating Category
```javascript
PUT /api/admin/audio-lessons/:id
{
  "category": "ipc"  // Must be valid category ID
}
```

## Validation
- Category field is **optional**
- When provided, must be one of the valid category IDs
- Invalid categories will return `400 Bad Request` with error message
- Frontend should use the category ID, not the name

## Implementation Details

### Files Modified
1. `src/common/enums/audio-lesson-category.enum.ts` - Category definitions
2. `src/schemas/audio-lesson.schema.ts` - Schema with enum validation
3. `src/audio-lessons/dto/create-audio-lesson.dto.ts` - DTO validation
4. `src/audio-lessons/dto/update-audio-lesson.dto.ts` - Update DTO validation
5. `src/audio-lessons/audio-lessons.service.ts` - Category methods
6. `src/audio-lessons/audio-lessons.controller.ts` - User endpoints
7. `src/audio-lessons/audio-lessons.admin.controller.ts` - Admin endpoints
