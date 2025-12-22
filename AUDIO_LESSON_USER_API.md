# Audio Lesson Module - Complete User Documentation

## 📋 Complete Schema Structure

### AudioFile Schema
```typescript
{
  url: string;           // File URL path
  fileName: string;      // Original filename
  fileSize: number;      // File size in bytes
  duration?: number;     // Audio duration (optional)
}
```

### AudioSubsection Schema
```typescript
{
  title: string;                    // Subsection title (required)
  
  // Text content in multiple languages/difficulties
  hindiText?: string;               // Hindi text content
  englishText?: string;             // English text content
  easyHindiText?: string;           // Simplified Hindi text
  easyEnglishText?: string;         // Simplified English text
  
  // Audio files for each variant
  hindiAudio?: AudioFile;           // Hindi audio
  englishAudio?: AudioFile;         // English audio
  easyHindiAudio?: AudioFile;       // Easy Hindi audio
  easyEnglishAudio?: AudioFile;     // Easy English audio
}
```

### AudioSection Schema
```typescript
{
  title: string;                    // Section title (required)
  
  // Text content in multiple languages/difficulties
  hindiText?: string;               // Hindi text content
  englishText?: string;             // English text content
  easyHindiText?: string;           // Simplified Hindi text
  easyEnglishText?: string;         // Simplified English text
  
  // Audio files for each variant
  hindiAudio?: AudioFile;           // Hindi audio
  englishAudio?: AudioFile;         // English audio
  easyHindiAudio?: AudioFile;       // Easy Hindi audio
  easyEnglishAudio?: AudioFile;     // Easy English audio
  
  // Subsections within this section
  subsections?: AudioSubsection[];  // Array of subsections
  totalSubsections: number;         // Auto-calculated count (default: 0)
}
```

### AudioLesson Schema (Main)
```typescript
{
  _id: string;                      // Unique lesson ID
  title: string;                    // Lesson title (required)
  headTitle?: string;               // Main topic/category
  description?: string;             // Lesson description (text only)
  
  // Auto-calculated counts
  totalSections: number;            // Total sections count (default: 0)
  totalSubsections: number;         // Total subsections across all sections (default: 0)
  
  // Content structure
  sections?: AudioSection[];        // Array of sections
  
  // Metadata
  category?: string;                // Lesson category
  tags?: string[];                  // Array of tags
  uploadedBy?: ObjectId;            // Reference to User who created
  isActive: boolean;                // Active status (default: true)
  
  // Timestamps
  createdAt: Date;                  // Creation timestamp
  updatedAt: Date;                  // Last update timestamp
}
```

## 🌐 User API Endpoints

### Base URL
```
/api/audio-lessons
```

### Authentication
All endpoints require JWT authentication via Bearer token.

---

### 1. Get All Audio Lessons
**GET** `/api/audio-lessons`

Retrieve paginated list of active audio lessons.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 12)
- `category` (string, optional): Filter by category
- `search` (string, optional): Search in title, description, transcript, tags

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons?page=1&limit=10&category=constitution" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "items": [
    {
      "_id": "lesson_id",
      "title": "Article 14 - Right to Equality",
      "headTitle": "Constitutional Law Fundamentals",
      "description": "Comprehensive study of equality principles",
      "totalSections": 2,
      "totalSubsections": 5,
      "category": "constitution",
      "tags": ["equality", "constitutional-law"],
      "sections": [
        {
          "title": "Introduction to Article 14",
          "totalSubsections": 2,
          "englishText": "Article 14 ensures equality...",
          "englishAudio": {
            "url": "/uploads/audio/section1-en.mp3",
            "fileName": "intro-article14-en.mp3",
            "fileSize": 1024000
          },
          "subsections": [
            {
              "title": "Historical Background",
              "englishText": "The concept originated...",
              "englishAudio": {
                "url": "/uploads/audio/subsection1-1-en.mp3",
                "fileName": "history-background-en.mp3",
                "fileSize": 512000
              }
            }
          ]
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

---

### 2. Get Categories
**GET** `/api/audio-lessons/categories`

Get categories with lesson counts.

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons/categories" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
[
  {
    "id": "constitution",
    "name": "Constitutional Law",
    "description": "Fundamental rights and constitutional principles",
    "count": 15,
    "isUsed": true
  },
  {
    "id": "criminal-law",
    "name": "Criminal Law",
    "description": "Criminal procedures and laws",
    "count": 8,
    "isUsed": true
  }
]
```

---

### 3. Get All Categories
**GET** `/api/audio-lessons/categories/all`

Get all available categories (including unused ones).

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons/categories/all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
[
  {
    "id": "constitution",
    "name": "Constitutional Law",
    "description": "Fundamental rights and constitutional principles"
  },
  {
    "id": "criminal-law",
    "name": "Criminal Law", 
    "description": "Criminal procedures and laws"
  },
  {
    "id": "civil-law",
    "name": "Civil Law",
    "description": "Civil rights and procedures"
  }
]
```

---

### 4. Search Audio Lessons
**GET** `/api/audio-lessons/search`

Search audio lessons by query string.

**Query Parameters:**
- `q` (string, required): Search query
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 12)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons/search?q=equality&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "items": [
    {
      "_id": "lesson_id",
      "title": "Article 14 - Right to Equality",
      "headTitle": "Constitutional Law Fundamentals",
      "description": "Study of equality principles...",
      "totalSections": 2,
      "totalSubsections": 5,
      "category": "constitution"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 5,
  "totalPages": 1
}
```

---

### 5. Get Lessons by Category
**GET** `/api/audio-lessons/category/:category`

Get all lessons in a specific category.

**Path Parameters:**
- `category` (string, required): Category ID

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 12)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons/category/constitution?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "items": [
    {
      "_id": "lesson_id",
      "title": "Article 14 - Right to Equality",
      "headTitle": "Constitutional Law Fundamentals",
      "category": "constitution",
      "totalSections": 2,
      "totalSubsections": 5
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

---

### 6. Get Specific Audio Lesson
**GET** `/api/audio-lessons/:id`

Get detailed information about a specific audio lesson.

**Path Parameters:**
- `id` (string, required): Lesson ID

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/audio-lessons/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "title": "Article 14 - Right to Equality",
  "headTitle": "Constitutional Law Fundamentals",
  "description": "Comprehensive study of Article 14 covering equality before law, equal protection, and reasonable classification principles",
  "totalSections": 2,
  "totalSubsections": 5,
  "category": "constitution",
  "tags": ["equality", "constitutional-law", "fundamental-rights"],
  "sections": [
    {
      "title": "Introduction to Article 14",
      "totalSubsections": 2,
      "englishText": "Article 14 ensures equality before law and equal protection of laws...",
      "hindiText": "अनुच्छेद 14 कानून के समक्ष समानता और कानूनों का समान संरक्षण सुनिश्चित करता है...",
      "englishAudio": {
        "url": "/uploads/audio/section1-en.mp3",
        "fileName": "intro-article14-en.mp3",
        "fileSize": 1024000,
        "duration": 180
      },
      "hindiAudio": {
        "url": "/uploads/audio/section1-hi.mp3",
        "fileName": "intro-article14-hi.mp3",
        "fileSize": 987000,
        "duration": 175
      },
      "subsections": [
        {
          "title": "Historical Background",
          "englishText": "The concept of equality before law originated from British legal system...",
          "hindiText": "कानून के समक्ष समानता की अवधारणा ब्रिटिश कानूनी व्यवस्था से उत्पन्न हुई...",
          "englishAudio": {
            "url": "/uploads/audio/subsection1-1-en.mp3",
            "fileName": "history-background-en.mp3",
            "fileSize": 512000,
            "duration": 90
          },
          "hindiAudio": {
            "url": "/uploads/audio/subsection1-1-hi.mp3",
            "fileName": "history-background-hi.mp3",
            "fileSize": 487000,
            "duration": 85
          }
        },
        {
          "title": "Constitutional Provisions",
          "englishText": "Article 14 states that the State shall not deny to any person equality before the law...",
          "hindiText": "अनुच्छेद 14 कहता है कि राज्य किसी भी व्यक्ति को कानून के समक्ष समानता से वंचित नहीं करेगा...",
          "englishAudio": {
            "url": "/uploads/audio/subsection1-2-en.mp3",
            "fileName": "constitutional-provisions-en.mp3",
            "fileSize": 678000,
            "duration": 120
          },
          "hindiAudio": {
            "url": "/uploads/audio/subsection1-2-hi.mp3",
            "fileName": "constitutional-provisions-hi.mp3",
            "fileSize": 645000,
            "duration": 115
          },
          "easyEnglishAudio": {
            "url": "/uploads/audio/subsection1-2-easy-en.mp3",
            "fileName": "constitutional-provisions-easy-en.mp3",
            "fileSize": 567000,
            "duration": 100
          }
        }
      ]
    },
    {
      "title": "Key Principles and Applications",
      "totalSubsections": 3,
      "englishText": "The key principles of Article 14 include equality before law, equal protection of laws, and reasonable classification...",
      "subsections": [
        {
          "title": "Equality Before Law",
          "englishText": "This principle means that all persons, regardless of their status, are subject to the same laws...",
          "englishAudio": {
            "url": "/uploads/audio/subsection2-1-en.mp3",
            "fileName": "equality-before-law-en.mp3",
            "fileSize": 445000,
            "duration": 80
          }
        },
        {
          "title": "Equal Protection of Laws",
          "englishText": "Equal protection ensures that similar cases are treated similarly by the law...",
          "hindiText": "समान संरक्षण सुनिश्चित करता है कि समान मामलों के साथ कानून द्वारा समान व्यवहार किया जाए...",
          "englishAudio": {
            "url": "/uploads/audio/subsection2-2-en.mp3",
            "fileName": "equal-protection-en.mp3",
            "fileSize": 523000,
            "duration": 95
          },
          "hindiAudio": {
            "url": "/uploads/audio/subsection2-2-hi.mp3",
            "fileName": "equal-protection-hi.mp3",
            "fileSize": 498000,
            "duration": 90
          }
        },
        {
          "title": "Reasonable Classification",
          "englishText": "The doctrine of reasonable classification allows the state to make distinctions between different classes of people...",
          "englishAudio": {
            "url": "/uploads/audio/subsection2-3-en.mp3",
            "fileName": "reasonable-classification-en.mp3",
            "fileSize": 612000,
            "duration": 110
          }
        }
      ]
    }
  ],
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🔐 Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📱 Usage Examples

### Frontend Integration

```javascript
// Get all lessons
const getLessons = async (page = 1, category = null) => {
  const params = new URLSearchParams({ page, limit: 12 });
  if (category) params.append('category', category);
  
  const response = await fetch(`/api/audio-lessons?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};

// Search lessons
const searchLessons = async (query) => {
  const response = await fetch(`/api/audio-lessons/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};

// Get specific lesson
const getLesson = async (id) => {
  const response = await fetch(`/api/audio-lessons/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

## 🎯 Key Features for Users

### Content Organization
- **Hierarchical Structure**: Head Title → Sections → Subsections
- **Multi-language Support**: English and Hindi content at all levels
- **Difficulty Levels**: Standard and easy versions available
- **Flexible Navigation**: Jump to any section or subsection

### Search & Discovery
- **Full-text Search**: Search across titles, descriptions, and content
- **Category Filtering**: Browse by legal topics
- **Tag-based Discovery**: Find related content through tags
- **Pagination**: Efficient browsing of large content libraries

### Audio Features
- **Multiple Audio Variants**: Up to 4 audio versions per section/subsection
- **Independent Playback**: Play specific sections without full lesson
- **Language Selection**: Choose between English and Hindi audio
- **Quality Options**: Standard and simplified audio versions

This comprehensive structure provides maximum flexibility for legal education content while maintaining clean organization and efficient access patterns.