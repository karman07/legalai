# Answer Check Module

## Overview
The Answer Check module provides AI-powered evaluation of student answers using Google Gemini. Students can upload answer files in various formats (PDF, images, documents) along with questions and receive detailed scoring, feedback, and suggestions for improvement.

## Features

### ✅ Core Functionality
- **Multi-format Support**: PDF, JPG, PNG, DOCX, TXT files
- **AI Evaluation**: Powered by Google Gemini 2.0 Flash
- **Detailed Scoring**: Marks out of total with percentage
- **Comprehensive Feedback**: Detailed evaluation explanation
- **Improvement Suggestions**: Actionable recommendations
- **Custom Grading Criteria**: Optional specific evaluation parameters

### ✅ History & Tracking
- **Complete History**: All previous answer checks saved
- **Pagination**: Efficient browsing of large histories
- **Individual Retrieval**: Access specific answer check details
- **User Isolation**: Each user sees only their own data

### ✅ File Management
- **Secure Upload**: Files stored in dedicated directory
- **Size Validation**: 10MB maximum file size
- **Type Validation**: Only supported formats allowed
- **Automatic Cleanup**: Organized file storage system

## File Structure
```
src/answer-check/
├── dto/
│   └── check-answer.dto.ts          # Request validation
├── answer-check.controller.ts        # API endpoints
├── answer-check.service.ts          # Business logic
└── answer-check.module.ts           # Module configuration

src/schemas/
└── answer-check.schema.ts           # Database schema

uploads/answers/                     # File storage directory
```

## API Endpoints

### 1. POST /answer-check/check
Submit an answer file for AI evaluation.

**Request:**
- `file`: Answer file (required)
- `question`: Question text (required)
- `totalMarks`: Maximum marks 1-100 (required)
- `gradingCriteria`: Evaluation criteria (optional)

**Response:**
```json
{
  "scoredMarks": 8,
  "percentage": 80,
  "feedback": "Detailed evaluation...",
  "suggestions": "Improvement recommendations..."
}
```

### 2. GET /answer-check/history
Retrieve paginated history of answer checks.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### 3. GET /answer-check/:id
Get specific answer check details by ID.

## Database Schema

```typescript
{
  userId: ObjectId,           // Reference to user
  question: string,           // Original question
  totalMarks: number,         // Maximum possible marks
  scoredMarks: number,        // AI-awarded marks
  percentage: number,         // Calculated percentage
  feedback: string,           // Detailed evaluation
  fileName: string,           // Original file name
  fileType: string,           // MIME type
  filePath: string,           // Server file path
  suggestions?: string,       // Improvement suggestions
  gradingCriteria?: string,   // Custom criteria used
  createdAt: Date,           // Timestamp
  updatedAt: Date            // Last modified
}
```

## Supported File Types

| Format | MIME Type | Description |
|--------|-----------|-------------|
| PDF | `application/pdf` | Recommended for text answers |
| JPEG | `image/jpeg`, `image/jpg` | Handwritten/scanned answers |
| PNG | `image/png` | Screenshots, diagrams |
| WebP | `image/webp` | Modern image format |
| Text | `text/plain` | Plain text files |
| Word | `application/msword` | Legacy Word documents |
| Word (Modern) | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | .docx files |

## Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
```

### File Upload Settings
- **Max Size**: 10MB
- **Storage**: `./uploads/answers/`
- **Naming**: `answer-{timestamp}-{random}.{ext}`

## Usage Examples

### Basic Answer Check
```bash
curl -X POST http://localhost:3000/answer-check/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@answer.pdf" \
  -F "question=Explain constitutional law" \
  -F "totalMarks=10"
```

### With Grading Criteria
```bash
curl -X POST http://localhost:3000/answer-check/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@answer.pdf" \
  -F "question=Explain constitutional law" \
  -F "totalMarks=10" \
  -F "gradingCriteria=Focus on examples and clarity"
```

### Get History
```bash
curl -X GET "http://localhost:3000/answer-check/history?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## AI Evaluation Process

1. **File Processing**: Extract content based on file type
2. **Prompt Construction**: Build evaluation prompt with question and criteria
3. **Gemini API Call**: Send content to Google Gemini for analysis
4. **Response Parsing**: Extract structured evaluation data
5. **Score Calculation**: Normalize marks and calculate percentage
6. **Database Storage**: Save complete evaluation record

## Error Handling

### Common Errors
- **400**: Missing file, invalid file type, validation errors
- **401**: Authentication required
- **404**: Answer check not found
- **500**: Gemini API errors, server issues

### File Validation
- File size must be ≤ 10MB
- File type must be supported
- File must be readable/valid

## Security Features

- **JWT Authentication**: All endpoints protected
- **User Isolation**: Users can only access their own data
- **File Validation**: Strict type and size checking
- **Path Security**: Files stored in controlled directory
- **Input Sanitization**: All inputs validated and sanitized

## Performance Considerations

- **Pagination**: Large histories handled efficiently
- **File Storage**: Organized directory structure
- **Database Indexing**: Optimized queries with user+date index
- **API Limits**: Gemini API rate limiting handled gracefully

## Testing

### Manual Testing
1. Use Postman collection: `Answer_Check_API.postman_collection.json`
2. Run test script: `node test-answer-check.js`
3. Test with various file formats and sizes

### Test Cases
- ✅ PDF text extraction and evaluation
- ✅ Image OCR and handwriting recognition
- ✅ Document format processing
- ✅ Error handling for invalid files
- ✅ Pagination and history retrieval
- ✅ Authentication and authorization

## Future Enhancements

### Planned Features
- [ ] Batch answer checking
- [ ] Answer comparison with model answers
- [ ] Plagiarism detection
- [ ] Export evaluation reports
- [ ] Answer analytics and insights
- [ ] Custom rubric support
- [ ] Multi-language support

### Optimization Opportunities
- [ ] Caching for repeated evaluations
- [ ] Background processing for large files
- [ ] File compression and optimization
- [ ] Advanced OCR for handwritten text
- [ ] Integration with learning management systems

## Troubleshooting

### Common Issues

**Gemini API Errors**
- Check API key configuration
- Verify API quota and billing
- Monitor rate limits

**File Upload Issues**
- Ensure uploads/answers directory exists
- Check file permissions
- Verify disk space

**Authentication Problems**
- Validate JWT token format
- Check token expiration
- Verify user permissions

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` for comprehensive error information.

## Support

For issues or questions:
1. Check API documentation: `ANSWER_CHECK_API.md`
2. Review error logs for specific issues
3. Test with Postman collection
4. Verify environment configuration