# PDF Management API (Admin Only)

Base URL: `http://localhost:3000/api`

Auth: All PDF endpoints require admin JWT token.
```
Authorization: Bearer ADMIN_TOKEN
```

---

## Upload PDF
**Endpoint:** `POST /admin/pdfs`

**Description:** Admin uploads a new PDF document

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "IPC Study Material",
  "description": "Complete IPC notes for law students",
  "fileUrl": "https://example.com/pdfs/ipc-notes.pdf",
  "fileName": "ipc-notes.pdf",
  "fileSize": 2048576
}
```

**Response:**
```json
{
  "_id": "674d8e9a1b2c3d4e5f6a7b8c",
  "title": "IPC Study Material",
  "description": "Complete IPC notes for law students",
  "fileUrl": "https://example.com/pdfs/ipc-notes.pdf",
  "fileName": "ipc-notes.pdf",
  "fileSize": 2048576,
  "uploadedBy": "507f1f77bcf86cd799439010",
  "isActive": true,
  "createdAt": "2025-12-14T10:30:00.000Z",
  "updatedAt": "2025-12-14T10:30:00.000Z"
}
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/api/admin/pdfs" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "IPC Study Material",
    "description": "Complete IPC notes",
    "fileUrl": "https://example.com/pdfs/ipc-notes.pdf",
    "fileName": "ipc-notes.pdf",
    "fileSize": 2048576
  }'
```

---

## List All PDFs
**Endpoint:** `GET /admin/pdfs`

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `isActive` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "items": [
    {
      "_id": "674d8e9a1b2c3d4e5f6a7b8c",
      "title": "IPC Study Material",
      "description": "Complete IPC notes",
      "fileUrl": "https://example.com/pdfs/ipc-notes.pdf",
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

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/admin/pdfs?page=1&limit=10&isActive=true" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Get PDF by ID
**Endpoint:** `GET /admin/pdfs/:id`

**Path Parameters:**
- `id`: PDF document ID

**Response:**
```json
{
  "_id": "674d8e9a1b2c3d4e5f6a7b8c",
  "title": "IPC Study Material",
  "description": "Complete IPC notes",
  "fileUrl": "https://example.com/pdfs/ipc-notes.pdf",
  "fileName": "ipc-notes.pdf",
  "fileSize": 2048576,
  "uploadedBy": "507f1f77bcf86cd799439010",
  "isActive": true,
  "createdAt": "2025-12-14T10:30:00.000Z",
  "updatedAt": "2025-12-14T10:30:00.000Z"
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/admin/pdfs/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Update PDF
**Endpoint:** `PUT /admin/pdfs/:id`

**Description:** Update PDF metadata or file URL

**Path Parameters:**
- `id`: PDF document ID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated IPC Study Material",
  "description": "Revised IPC notes with latest amendments",
  "fileUrl": "https://example.com/pdfs/ipc-notes-v2.pdf",
  "fileName": "ipc-notes-v2.pdf",
  "fileSize": 3145728,
  "isActive": true
}
```

**Response:**
```json
{
  "_id": "674d8e9a1b2c3d4e5f6a7b8c",
  "title": "Updated IPC Study Material",
  "description": "Revised IPC notes with latest amendments",
  "fileUrl": "https://example.com/pdfs/ipc-notes-v2.pdf",
  "fileName": "ipc-notes-v2.pdf",
  "fileSize": 3145728,
  "uploadedBy": "507f1f77bcf86cd799439010",
  "isActive": true,
  "createdAt": "2025-12-14T10:30:00.000Z",
  "updatedAt": "2025-12-14T11:45:00.000Z"
}
```

**cURL:**
```bash
curl -X PUT "http://localhost:3000/api/admin/pdfs/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated IPC Study Material",
    "isActive": true
  }'
```

---

## Delete PDF
**Endpoint:** `DELETE /admin/pdfs/:id`

**Description:** Permanently delete a PDF document

**Path Parameters:**
- `id`: PDF document ID

**Response:**
```json
{
  "message": "PDF deleted successfully",
  "id": "674d8e9a1b2c3d4e5f6a7b8c"
}
```

**cURL:**
```bash
curl -X DELETE "http://localhost:3000/api/admin/pdfs/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden (Non-Admin)
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "PDF not found",
  "error": "Not Found"
}
```

---

## Notes

- **File Upload:** This API manages PDF metadata only. For actual file uploads, integrate with cloud storage (AWS S3, Firebase Storage, Cloudinary) and pass the URL to `fileUrl`.
- **isActive Flag:** Use this to soft-delete or hide PDFs without removing them from the database.
- **File Size:** Store in bytes for consistency (e.g., 2048576 = 2 MB).

---

## Integration Example

### Upload to Firebase Storage (Client-side)
```javascript
// 1. Upload file to Firebase Storage
const storageRef = ref(storage, `pdfs/${file.name}`);
const snapshot = await uploadBytes(storageRef, file);
const downloadURL = await getDownloadURL(snapshot.ref);

// 2. Send metadata to backend
const response = await fetch('http://localhost:3000/api/admin/pdfs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'IPC Study Material',
    description: 'Complete IPC notes',
    fileUrl: downloadURL,
    fileName: file.name,
    fileSize: file.size,
  }),
});
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (not admin) |
| 404 | Not Found |
| 500 | Internal Server Error |
