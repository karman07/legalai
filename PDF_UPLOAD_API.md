# PDF Upload API with Multer (Admin Only)

Base URL: `http://localhost:3000/api`

Auth: All PDF endpoints require admin JWT token.
```
Authorization: Bearer ADMIN_TOKEN
```

## File Upload Configuration
- **Storage:** Local server storage in `./uploads/documents/`
- **Allowed Format:** Any file type (PDF, DOC, DOCX, TXT, MD, etc.)
- **Max File Size:** 100MB
- **Access URL:** `http://localhost:3000/uploads/documents/filename.ext`

---

## Upload Document
**Endpoint:** `POST /admin/pdfs`

**Description:** Admin uploads any document file with metadata

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required): Any document file to upload (PDF, DOC, DOCX, TXT, MD, etc.)
- `title` (required): Document title
- `description` (optional): PDF description
- For case law fields, see "Upload PDF with Case Law" example below

**Example - Basic PDF Upload:**
```bash
curl -X POST "http://localhost:3000/api/admin/pdfs" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@/path/to/ipc-notes.pdf" \
  -F "title=IPC Study Material" \
  -F "description=Complete IPC notes for law students"

# Works with any file type:
# -F "file=@/path/to/document.docx"
# -F "file=@/path/to/notes.md"
# -F "file=@/path/to/summary.txt"
```

**Example - PDF Upload with Case Law Metadata:**
```bash
curl -X POST "http://localhost:3000/api/admin/pdfs" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@/path/to/kesavananda-bharati.pdf" \
  -F "title=Kesavananda Bharati vs State of Kerala" \
  -F "description=Landmark case on basic structure doctrine" \
  -F "caseTitle=Kesavananda Bharati vs State of Kerala" \
  -F "caseNumber=Writ Petition (Civil) 135 of 1970" \
  -F "court={\"id\":\"SC001\",\"name\":\"Supreme Court of India\",\"level\":\"supreme\"}" \
  -F "judgmentDate=1973-04-24" \
  -F "year=1973" \
  -F "citation=AIR 1973 SC 1461" \
  -F "judges=[\"S.M. Sikri\",\"K.S. Hegde\",\"A.N. Grover\"]" \
  -F "summary=Established the basic structure doctrine" \
  -F "keywords=[\"basic structure\",\"fundamental rights\",\"constitutional amendment\"]" \
  -F "category=Constitutional Law"
```

**Note:** 
- For nested objects like `court`, send as JSON string
- For arrays like `judges` and `keywords`, send as JSON string array

**Example with Postman:**
1. Set method to POST
2. Add Authorization header: `Bearer ADMIN_TOKEN`
3. Select Body → form-data
4. Add key `file` (type: File) and select PDF
5. Add key `title` (type: Text)
6. Add key `description` (type: Text)
7. For case law fields:
   - `court` (type: Text): `{"id":"SC001","name":"Supreme Court of India","level":"supreme"}`
   - `judges` (type: Text): `["Judge 1","Judge 2"]`
   - `keywords` (type: Text): `["keyword1","keyword2"]`

**Response:**
```json
{
  "_id": "674d8e9a1b2c3d4e5f6a7b8c",
  "title": "IPC Study Material",
  "description": "Complete IPC notes for law students",
  "fileUrl": "/uploads/pdfs/pdf-1702561234567-123456789.pdf",
  "fileName": "ipc-notes.pdf",
  "fileSize": 2048576,
  "uploadedBy": "507f1f77bcf86cd799439010",
  "isActive": true,
  "createdAt": "2025-12-14T10:30:00.000Z",
  "updatedAt": "2025-12-14T10:30:00.000Z"
}
```

**Access the file:**
```
http://localhost:3000/uploads/documents/doc-1702561234567-123456789.pdf
```

---

## Update PDF
**Endpoint:** `PUT /admin/pdfs/:id`

**Description:** Update PDF metadata or replace the file

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (optional): New PDF file to replace existing
- `title` (optional): Updated title
- `description` (optional): Updated description
- `isActive` (optional): Active status (true/false)

**Example - Update metadata only:**
```bash
curl -X PUT "http://localhost:3000/api/admin/pdfs/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "title=Updated IPC Study Material" \
  -F "description=Revised notes with amendments"
```

**Example - Replace PDF file:**
```bash
curl -X PUT "http://localhost:3000/api/admin/pdfs/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@/path/to/updated-ipc-notes.pdf" \
  -F "title=Updated IPC Study Material"
```

**Response:**
```json
{
  "_id": "674d8e9a1b2c3d4e5f6a7b8c",
  "title": "Updated IPC Study Material",
  "description": "Revised notes with amendments",
  "fileUrl": "/uploads/pdfs/pdf-1702561345678-987654321.pdf",
  "fileName": "updated-ipc-notes.pdf",
  "fileSize": 3145728,
  "uploadedBy": "507f1f77bcf86cd799439010",
  "isActive": true,
  "createdAt": "2025-12-14T10:30:00.000Z",
  "updatedAt": "2025-12-14T11:45:00.000Z"
}
```

---

## List All PDFs
**Endpoint:** `GET /admin/pdfs`

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `isActive` (optional): Filter by active status (true/false)

**Example:**
```bash
curl -X GET "http://localhost:3000/api/admin/pdfs?page=1&limit=10&isActive=true" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "items": [
    {
      "_id": "674d8e9a1b2c3d4e5f6a7b8c",
      "title": "IPC Study Material",
      "description": "Complete IPC notes",
      "fileUrl": "/uploads/pdfs/pdf-1702561234567-123456789.pdf",
      "fileName": "ipc-notes.pdf",
      "fileSize": 2048576,
      "uploadedBy": "507f1f77bcf86cd799439010",
      "isActive": true,
      "createdAt": "2025-12-14T10:30:00.000Z",
      "updatedAt": "2025-12-14T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## Get PDF by ID
**Endpoint:** `GET /admin/pdfs/:id`

**Example:**
```bash
curl -X GET "http://localhost:3000/api/admin/pdfs/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "_id": "674d8e9a1b2c3d4e5f6a7b8c",
  "title": "IPC Study Material",
  "description": "Complete IPC notes",
  "fileUrl": "/uploads/pdfs/pdf-1702561234567-123456789.pdf",
  "fileName": "ipc-notes.pdf",
  "fileSize": 2048576,
  "uploadedBy": "507f1f77bcf86cd799439010",
  "isActive": true,
  "createdAt": "2025-12-14T10:30:00.000Z",
  "updatedAt": "2025-12-14T10:30:00.000Z"
}
```

---

## Delete PDF
**Endpoint:** `DELETE /admin/pdfs/:id`

**Description:** Permanently delete PDF record from database (file remains on disk)

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/admin/pdfs/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "message": "PDF deleted successfully",
  "id": "674d8e9a1b2c3d4e5f6a7b8c"
}
```

**Note:** This only deletes the database record. To also delete the physical file, you would need to implement file system cleanup.

---

## Error Responses

### 400 Bad Request - No file uploaded
```json
{
  "statusCode": 400,
  "message": "File is required",
  "error": "Bad Request"
}
```

### 413 Payload Too Large
```json
{
  "statusCode": 413,
  "message": "File too large",
  "error": "Payload Too Large"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "PDF not found"
}
```

---

## Frontend Integration Examples

### React/Next.js with FormData
```javascript
async function uploadPdf(file, title, description, adminToken) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('description', description);

  const response = await fetch('http://localhost:3000/api/admin/pdfs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: formData,
  });

  return await response.json();
}

// Usage
const file = document.querySelector('input[type="file"]').files[0];
const result = await uploadPdf(file, 'IPC Notes', 'Study material', adminToken);
console.log('Uploaded:', result.fileUrl);
```

### Axios Example
```javascript
import axios from 'axios';

async function uploadPdf(file, title, description, adminToken) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('description', description);

  const { data } = await axios.post(
    'http://localhost:3000/api/admin/pdfs',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data;
}
```

---

---

## User Endpoints (Public Access)

Users can access PDFs at `/api/pdfs` (requires JWT authentication but not admin role).

### List PDFs (User)
```bash
curl -X GET "http://localhost:3000/api/pdfs?page=1&limit=12" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Get Categories
```bash
curl -X GET "http://localhost:3000/api/pdfs/categories" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Search PDFs
```bash
curl -X GET "http://localhost:3000/api/pdfs/search?q=constitutional&page=1&limit=12" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Filter by Category
```bash
curl -X GET "http://localhost:3000/api/pdfs/category/Constitutional%20Law?page=1&limit=12" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Filter by Court Level
```bash
curl -X GET "http://localhost:3000/api/pdfs/court/supreme?page=1&limit=12" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Filter by Year
```bash
curl -X GET "http://localhost:3000/api/pdfs/year/1973?page=1&limit=12" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Get PDF by ID
```bash
curl -X GET "http://localhost:3000/api/pdfs/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## Important Notes

1. **File Storage:**
   - Files are stored in `./uploads/documents/` directory on the server
   - Filenames are auto-generated with timestamp and random suffix (e.g., `doc-1702561234567-123456789.pdf`)
   - Original filename is preserved in the `fileName` field
   - Supports any file type: PDF, DOC, DOCX, TXT, MD, etc.

2. **File Access:**
   - Files are publicly accessible at `http://localhost:3000/uploads/documents/{filename}`
   - No authentication required to download files
   - To restrict access, implement a download endpoint with auth checks

3. **File Size:**
   - Maximum upload size: 100MB
   - Stored in bytes in the database
   - Can be adjusted in controller configuration

4. **File Type:**
   - All file types are accepted (PDF, DOC, DOCX, TXT, MD, etc.)
   - No MIME type restrictions

5. **Cleanup:**
   - Deleting a PDF record does NOT delete the physical file
   - Implement a cleanup service if you need to remove unused files

6. **Production Considerations:**
   - For production, consider using cloud storage (S3, Azure Blob, GCS)
   - Implement file size validation on client side
   - Add virus scanning for uploaded files
   - Implement proper file cleanup/garbage collection
   - Consider CDN for serving static files

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, no file) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (not admin) |
| 404 | Not Found |
| 413 | Payload Too Large (file > 100MB) |
| 500 | Internal Server Error |
