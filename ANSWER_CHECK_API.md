# Answer Check API Documentation

## Overview
The Answer Check module allows users to upload answer files (PDF, images, documents) along with questions and get AI-powered scoring and feedback using Google Gemini.

## Base URL
```
/answer-check
```

## Authentication
All endpoints require JWT authentication via Bearer token.

## Endpoints

### 1. Check Answer
**POST** `/answer-check/check`

Upload an answer file and get AI evaluation.

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file, required): Answer file (PDF, JPG, PNG, DOCX, TXT, etc.)
- `question` (string, required): The question being answered
- `totalMarks` (number, required): Total marks for the question (1-100)
- `gradingCriteria` (string, optional): Specific grading criteria

**Example Request:**
```bash
curl -X POST http://localhost:3000/answer-check/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@answer.pdf" \
  -F "question=Explain the concept of constitutional law" \
  -F "totalMarks=10" \
  -F "gradingCriteria=Focus on clarity, examples, and legal principles"
```

**Response:**
```json
{
  "scoredMarks": 8,
  "percentage": 80,
  "feedback": "Good understanding of constitutional law concepts. The answer covers key principles but could benefit from more specific examples.",
  "suggestions": "Include more case law references and provide concrete examples to strengthen your arguments."
}
```

### 2. Get History
**GET** `/answer-check/history`

Retrieve user's answer checking history with pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/answer-check/history?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "results": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "question": "Explain constitutional law",
      "totalMarks": 10,
      "scoredMarks": 8,
      "percentage": 80,
      "feedback": "Good understanding...",
      "fileName": "answer.pdf",
      "fileType": "application/pdf",
      "suggestions": "Include more examples...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "pages": 5
  }
}
```

### 3. Get Specific Answer Check
**GET** `/answer-check/:id`

Retrieve details of a specific answer check.

**Parameters:**
- `id` (string, required): Answer check ID

**Example Request:**
```bash
curl -X GET http://localhost:3000/answer-check/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "question": "Explain constitutional law",
  "totalMarks": 10,
  "scoredMarks": 8,
  "percentage": 80,
  "feedback": "Good understanding of constitutional law concepts...",
  "fileName": "answer.pdf",
  "fileType": "application/pdf",
  "suggestions": "Include more case law references...",
  "gradingCriteria": "Focus on clarity, examples, and legal principles",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Supported File Types
- **PDF**: `application/pdf`
- **Images**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- **Text**: `text/plain`
- **Word Documents**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## File Size Limits
- Maximum file size: 10MB

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "File is required"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "GEMINI_API_KEY not configured"
}
```

## Features
- ✅ Multi-format file support (PDF, images, documents)
- ✅ AI-powered evaluation using Google Gemini
- ✅ Detailed feedback and suggestions
- ✅ Score calculation with percentage
- ✅ Complete history tracking
- ✅ Pagination support
- ✅ File validation and size limits
- ✅ User-specific data isolation

## Usage Tips
1. Ensure clear, readable answer files for better AI evaluation
2. Provide specific grading criteria for more accurate scoring
3. Use appropriate file formats (PDF recommended for text answers)
4. Check history regularly to track improvement over time