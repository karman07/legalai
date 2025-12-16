# Testing PDF Upload API

## Prerequisites
1. **Start the server:**
   ```bash
   npm run start:dev
   ```
   Server should be running at: `http://localhost:3000`

2. **Get Admin Token:**
   You need a valid admin JWT token. If you don't have one, login as admin first.

---

## Quick Test with cURL

### Test 1: Basic PDF Upload
```bash
curl -X POST "http://localhost:3000/api/admin/pdfs" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -F "file=@C:\path\to\your\file.pdf" \
  -F "title=Test PDF Upload" \
  -F "description=Testing basic upload"
```

**Expected Response:** Status 201 with PDF object containing `_id`, `fileUrl`, etc.

---

### Test 2: List All PDFs
```bash
curl -X GET "http://localhost:3000/api/admin/pdfs" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Expected Response:** Status 200 with paginated list

---

### Test 3: Get PDF by ID (use ID from upload response)
```bash
curl -X GET "http://localhost:3000/api/admin/pdfs/YOUR_PDF_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Expected Response:** Status 200 with single PDF object

---

### Test 4: Upload with Case Law Data
```bash
curl -X POST "http://localhost:3000/api/admin/pdfs" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -F "file=@C:\path\to\your\file.pdf" \
  -F "title=Kesavananda Bharati Case" \
  -F "caseTitle=Kesavananda Bharati vs State of Kerala" \
  -F "caseNumber=WP 135/1970" \
  -F "court={\"id\":\"SC001\",\"name\":\"Supreme Court of India\",\"level\":\"supreme\"}" \
  -F "judgmentDate=1973-04-24" \
  -F "year=1973" \
  -F "citation=AIR 1973 SC 1461" \
  -F "judges=[\"S.M. Sikri\",\"K.S. Hegde\"]" \
  -F "keywords=[\"basic structure\",\"constitutional law\"]" \
  -F "category=Constitutional Law" \
  -F "summary=Landmark judgment establishing basic structure doctrine"
```

**Expected Response:** Status 201 with all case law fields populated

---

## Common 404 Errors & Solutions

### Error: `Cannot POST /admin/pdfs`
**Problem:** Missing `/api` prefix
**Solution:** Use `http://localhost:3000/api/admin/pdfs` (note the `/api/`)

### Error: `Cannot GET /api/admin/pdfs`
**Problem:** Server not running or wrong port
**Solution:** 
1. Check if server is running: `netstat -ano | findstr :3000`
2. Restart server: `npm run start:dev`
3. Verify the console shows: `Application is running on: http://localhost:3000`

### Error: 401 Unauthorized
**Problem:** Missing or invalid admin token
**Solution:** Replace `YOUR_ADMIN_TOKEN_HERE` with actual JWT token from login

### Error: 403 Forbidden
**Problem:** Token is valid but user is not an admin
**Solution:** Login with admin credentials to get admin token

### Error: 400 Bad Request - "PDF file is required"
**Problem:** File not attached or wrong field name
**Solution:** 
- Ensure file field is named `file` (not `pdf` or anything else)
- Check file path is correct and file exists
- In Windows, use full path like `C:\Users\Dell\Downloads\test.pdf`

### Error: 400 Bad Request - "Only PDF files are allowed"
**Problem:** File is not a PDF or has wrong MIME type
**Solution:** Only upload files with `.pdf` extension

---

## Postman Testing

1. **Import Collection:**
   - Import `PDF_Upload_API.postman_collection.json`
   
2. **Set Variables:**
   - Click on collection → Variables tab
   - Set `ADMIN_TOKEN` to your admin JWT token
   - Set `BASE_URL` to `http://localhost:3000/api` (if different)

3. **Test Upload:**
   - Open "Upload PDF" request
   - In Body → form-data
   - Click on `file` field and select a PDF file
   - Click Send

4. **Auto-Save ID:**
   - The collection automatically saves the PDF ID after upload
   - Use it in "Get PDF by ID", "Update PDF", "Delete PDF" requests

---

## Verify File Upload

After successful upload, check:

1. **Database:** MongoDB should have the record
2. **File System:** Check `./uploads/pdfs/` directory for the file
3. **Access URL:** Visit `http://localhost:3000/uploads/pdfs/[filename]` to download

Example:
```
http://localhost:3000/uploads/pdfs/pdf-1702561234567-123456789.pdf
```

---

## Troubleshooting Checklist

- [ ] Server is running (`npm run start:dev`)
- [ ] Using correct URL: `http://localhost:3000/api/admin/pdfs`
- [ ] Authorization header included with valid admin token
- [ ] File field is named `file` (case-sensitive)
- [ ] Uploading actual PDF file (not image or document)
- [ ] File size is under 50MB
- [ ] `./uploads/pdfs/` directory exists (should be created automatically)
- [ ] For case law: nested objects sent as JSON strings

---

## Testing Backend Responses

### Success Response Structure
```json
{
  "_id": "674d8e9a1b2c3d4e5f6a7b8c",
  "title": "Test PDF",
  "description": "Description here",
  "fileUrl": "/uploads/pdfs/pdf-1702561234567-123456789.pdf",
  "fileName": "original-name.pdf",
  "fileSize": 2048576,
  "uploadedBy": "507f1f77bcf86cd799439010",
  "isActive": true,
  "createdAt": "2025-12-15T10:30:00.000Z",
  "updatedAt": "2025-12-15T10:30:00.000Z",
  "caseTitle": "Case Name",
  "court": {
    "id": "SC001",
    "name": "Supreme Court of India",
    "level": "supreme"
  },
  "judges": ["Judge 1", "Judge 2"],
  "keywords": ["keyword1", "keyword2"]
}
```

### Error Response Structure
```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```
