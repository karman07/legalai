# PDF & Case Law User API

Base URL: `http://localhost:3000/api`

Auth: All endpoints require a valid JWT in the `Authorization` header.
```
Authorization: Bearer YOUR_USER_TOKEN
```

---

## List All PDFs
**Endpoint:** `GET /pdfs`

**Description:** Get paginated list of all active PDFs and case laws

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `category` (optional): Filter by category
- `year` (optional): Filter by judgment year
- `courtLevel` (optional): Filter by court level (supreme/high/district)

**Example:**
```bash
curl -X GET "http://localhost:3000/api/pdfs?page=1&limit=10&category=Constitutional Law" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Response:**
```json
{
  "items": [
    {
      "_id": "674d8e9a1b2c3d4e5f6a7b8c",
      "title": "Kesavananda Bharati vs State of Kerala",
      "description": "Landmark judgment on basic structure doctrine",
      "fileUrl": "/uploads/pdfs/pdf-1702561234567-123456789.pdf",
      "fileName": "kesavananda-bharati.pdf",
      "fileSize": 2048576,
      "caseTitle": "Kesavananda Bharati vs State of Kerala",
      "caseNumber": "Writ Petition (Civil) No. 135 of 1970",
      "court": {
        "id": "SC-001",
        "name": "Supreme Court of India",
        "level": "supreme",
        "state": null
      },
      "judgmentDate": "1973-04-24T00:00:00.000Z",
      "year": 1973,
      "citation": "AIR 1973 SC 1461",
      "judges": ["Justice S.M. Sikri", "Justice K.S. Hegde"],
      "summary": "Landmark case establishing the basic structure doctrine",
      "keywords": ["basic structure", "constitutional law", "fundamental rights"],
      "category": "Constitutional Law",
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
**Endpoint:** `GET /pdfs/:id`

**Description:** Get detailed information about a specific PDF/case law

**Example:**
```bash
curl -X GET "http://localhost:3000/api/pdfs/674d8e9a1b2c3d4e5f6a7b8c" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Response:**
```json
{
  "_id": "674d8e9a1b2c3d4e5f6a7b8c",
  "title": "Kesavananda Bharati vs State of Kerala",
  "description": "Landmark judgment on basic structure doctrine",
  "fileUrl": "/uploads/pdfs/pdf-1702561234567-123456789.pdf",
  "fileName": "kesavananda-bharati.pdf",
  "fileSize": 2048576,
  "caseTitle": "Kesavananda Bharati vs State of Kerala",
  "caseNumber": "Writ Petition (Civil) No. 135 of 1970",
  "court": {
    "id": "SC-001",
    "name": "Supreme Court of India",
    "level": "supreme"
  },
  "judgmentDate": "1973-04-24T00:00:00.000Z",
  "year": 1973,
  "citation": "AIR 1973 SC 1461",
  "judges": [
    "Justice S.M. Sikri",
    "Justice K.S. Hegde",
    "Justice A.N. Grover"
  ],
  "summary": "This landmark case established the basic structure doctrine, which holds that certain fundamental features of the Indian Constitution cannot be altered or destroyed through amendments by Parliament.",
  "fullText": "The full judgment text...",
  "keywords": ["basic structure", "constitutional law", "fundamental rights", "article 368"],
  "category": "Constitutional Law",
  "isActive": true,
  "createdAt": "2025-12-14T10:30:00.000Z",
  "updatedAt": "2025-12-14T10:30:00.000Z"
}
```

---

## Search PDFs
**Endpoint:** `GET /pdfs/search?q=query`

**Description:** Search PDFs by title, case title, case number, or keywords

**Query Parameters:**
- `q` (required): Search query string
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Example:**
```bash
curl -X GET "http://localhost:3000/api/pdfs/search?q=fundamental%20rights&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Response:**
```json
{
  "items": [
    {
      "_id": "674d8e9a1b2c3d4e5f6a7b8c",
      "title": "Maneka Gandhi vs Union of India",
      "caseTitle": "Maneka Gandhi vs Union of India",
      "caseNumber": "AIR 1978 SC 597",
      "year": 1978,
      "citation": "AIR 1978 SC 597",
      "summary": "Expanded interpretation of Article 21",
      "keywords": ["fundamental rights", "article 21", "personal liberty"],
      "category": "Constitutional Law",
      "fileUrl": "/uploads/pdfs/pdf-1702561345678-987654321.pdf"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## Filter by Category
**Endpoint:** `GET /pdfs/category/:category`

**Description:** Get all PDFs in a specific category

**Example:**
```bash
curl -X GET "http://localhost:3000/api/pdfs/category/Constitutional%20Law?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Response:** Same structure as List All PDFs

---

## Filter by Court Level
**Endpoint:** `GET /pdfs/court/:level`

**Description:** Get all PDFs from specific court level

**Path Parameters:**
- `level`: 'supreme' | 'high' | 'district'

**Example:**
```bash
curl -X GET "http://localhost:3000/api/pdfs/court/supreme?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

---

## Filter by Year
**Endpoint:** `GET /pdfs/year/:year`

**Description:** Get all PDFs from a specific year

**Example:**
```bash
curl -X GET "http://localhost:3000/api/pdfs/year/1973?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

---

## Download PDF
**Endpoint:** `GET /uploads/pdfs/:filename`

**Description:** Direct download link (no auth required for file access)

**Example:**
```bash
curl -O "http://localhost:3000/uploads/pdfs/pdf-1702561234567-123456789.pdf"
```

Or open directly in browser:
```
http://localhost:3000/uploads/pdfs/pdf-1702561234567-123456789.pdf
```

---

## Get Categories
**Endpoint:** `GET /pdfs/categories`

**Description:** Get list of all available categories

**Example:**
```bash
curl -X GET "http://localhost:3000/api/pdfs/categories" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Response:**
```json
{
  "categories": [
    "Constitutional Law",
    "Criminal Law",
    "Civil Law",
    "Corporate Law",
    "Family Law"
  ]
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "PDF not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid PDF id"
}
```

---

## Frontend Integration Examples

### React Component - List PDFs
```javascript
import { useState, useEffect } from 'react';

function PdfList() {
  const [pdfs, setPdfs] = useState([]);
  const [page, setPage] = useState(1);
  const userToken = localStorage.getItem('user_token');

  useEffect(() => {
    async function fetchPdfs() {
      const response = await fetch(
        `http://localhost:3000/api/pdfs?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );
      const data = await response.json();
      setPdfs(data.items);
    }
    fetchPdfs();
  }, [page]);

  return (
    <div>
      {pdfs.map(pdf => (
        <div key={pdf._id}>
          <h3>{pdf.caseTitle || pdf.title}</h3>
          <p>{pdf.summary}</p>
          <a href={`http://localhost:3000${pdf.fileUrl}`} target="_blank">
            Download PDF
          </a>
        </div>
      ))}
    </div>
  );
}
```

### Search with Debouncing
```javascript
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

function PdfSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const userToken = localStorage.getItem('user_token');

  const searchPdfs = debounce(async (searchQuery) => {
    if (!searchQuery) return;
    
    const response = await fetch(
      `http://localhost:3000/api/pdfs/search?q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    setResults(data.items);
  }, 500);

  useEffect(() => {
    searchPdfs(query);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cases..."
      />
      {results.map(pdf => (
        <div key={pdf._id}>
          <h4>{pdf.caseTitle}</h4>
          <p>{pdf.citation}</p>
        </div>
      ))}
    </div>
  );
}
```

### Filter by Category
```javascript
async function getPdfsByCategory(category, userToken) {
  const response = await fetch(
    `http://localhost:3000/api/pdfs/category/${encodeURIComponent(category)}`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    }
  );
  return await response.json();
}

// Usage
const constitutionalCases = await getPdfsByCategory('Constitutional Law', userToken);
```

### Axios Example with Filters
```javascript
import axios from 'axios';

async function fetchPdfs(filters = {}) {
  const userToken = localStorage.getItem('user_token');
  
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    ...(filters.category && { category: filters.category }),
    ...(filters.year && { year: filters.year }),
    ...(filters.courtLevel && { courtLevel: filters.courtLevel }),
  });

  const { data } = await axios.get(
    `http://localhost:3000/api/pdfs?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    }
  );

  return data;
}

// Usage examples
const allPdfs = await fetchPdfs({ page: 1, limit: 20 });
const supremeCourtCases = await fetchPdfs({ courtLevel: 'supreme' });
const year2020Cases = await fetchPdfs({ year: 2020 });
const criminalLawCases = await fetchPdfs({ category: 'Criminal Law' });
```

---

## Data Structure Reference

### PDF/Case Law Object
```typescript
interface Court {
  id: string;
  name: string;
  level: 'supreme' | 'high' | 'district';
  state?: string;
  created_at?: Date;
}

interface Pdf {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadedBy?: string;
  isActive: boolean;
  
  // Case Law Fields
  caseTitle?: string;
  caseNumber?: string;
  court?: Court;
  judgmentDate?: Date;
  year?: number;
  citation?: string;
  judges?: string[];
  summary?: string;
  fullText?: string;
  keywords?: string[];
  category?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Use Cases

### 1. Legal Research Platform
Display case laws with filtering by court, year, and category for students and lawyers.

### 2. Case Law Database
Build a searchable repository of judgments with full-text search and metadata.

### 3. Study Material Portal
Organize and categorize PDFs for law students with summary and keywords.

### 4. Citation Reference System
Quick lookup by citation number or case number for legal professionals.

---

## Notes

- All PDFs with `isActive: false` are hidden from user endpoints
- File downloads are public (no auth required) once you have the URL
- Search is case-insensitive and searches across multiple fields
- Pagination is recommended for better performance
- Use keywords array for better search results
- Court level filtering helps narrow down jurisdiction-specific cases

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (no/invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |
