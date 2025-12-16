# Media Manager - Audio & PDF Implementation

## Overview
Complete implementation of Audio Lessons and PDF Documents management system with all API endpoints from the Postman collection.

## Features Implemented

### 🎵 Audio Lessons Management
- **Upload Audio** - Upload audio files (MP3, WAV, M4A) up to 500MB with metadata
- **List Audio** - Paginated list with search and category filters
- **View Audio** - Play audio directly from the interface
- **Edit Audio** - Update metadata and replace audio files
- **Delete Audio** - Remove audio lessons
- **Retry Transcription** - Manually retry failed transcriptions
- **Categories** - View and filter by audio categories
- **Transcript Support** - Upload pre-made transcripts or auto-generate

### 📄 PDF Documents Management
- **Upload PDF** - Upload PDF files up to 100MB with comprehensive metadata
- **List PDFs** - Paginated list with search and status filters
- **View PDF** - Open PDFs in new tab
- **Edit PDF** - Update metadata and replace PDF files
- **Delete PDF** - Remove PDF documents
- **Case Details** - Full support for legal case information:
  - Case title and number
  - Court details (ID, name, level)
  - Year, keywords, judges
  - Case summary

## API Endpoints Covered

### Audio Lessons APIs
✅ POST `/admin/audio-lessons` - Upload audio with transcription
✅ GET `/admin/audio-lessons` - List all audio lessons (paginated)
✅ GET `/admin/audio-lessons/categories` - Get categories with count
✅ GET `/admin/audio-lessons/categories/all` - Get all categories
✅ GET `/admin/audio-lessons/:id` - Get audio by ID
✅ POST `/admin/audio-lessons/:id/retry-transcription` - Retry transcription
✅ PUT `/admin/audio-lessons/:id` - Update audio lesson
✅ DELETE `/admin/audio-lessons/:id` - Delete audio lesson

### PDF APIs
✅ POST `/admin/pdfs` - Upload PDF with metadata
✅ GET `/admin/pdfs` - List all PDFs (paginated, filterable)
✅ GET `/admin/pdfs/:id` - Get PDF by ID
✅ PUT `/admin/pdfs/:id` - Update PDF
✅ DELETE `/admin/pdfs/:id` - Delete PDF

## File Structure

```
src/
├── pages/
│   ├── MediaManager.tsx          # Main page with tabs
│   └── media/
│       ├── AudioManager.tsx      # Audio list & management
│       ├── AudioUploadModal.tsx  # Audio upload form
│       ├── AudioEditModal.tsx    # Audio edit form
│       ├── PDFManager.tsx        # PDF list & management
│       ├── PDFUploadModal.tsx    # PDF upload form
│       └── PDFEditModal.tsx      # PDF edit form
├── services/
│   └── mediaService.ts           # API service layer
└── types/
    └── media.ts                  # TypeScript interfaces
```

## UI Features

### Responsive Design
- Mobile-first approach
- Grid layout adapts to screen size
- Touch-friendly controls
- Modal dialogs for forms

### Color-Coded Status
- 🟢 Green - Active/Published/Completed
- 🔵 Blue - Processing
- 🔴 Red - Failed/Inactive
- ⚪ Gray - Pending/Draft

### Search & Filters
- Real-time search by title
- Category filtering (Audio)
- Status filtering (PDF)
- Pagination controls

### File Information Display
- File size formatting
- Duration display (Audio)
- Transcript status (Audio)
- Case details (PDF)
- Keywords and tags

## Usage

1. **Navigate to Media Manager**
   - Click "Media Manager" in the sidebar
   - Choose between Audio Lessons or PDF Documents tabs

2. **Upload Files**
   - Click "Upload Audio" or "Upload PDF"
   - Fill in required fields (marked with *)
   - Select file from your computer
   - Submit form

3. **Manage Content**
   - Search using the search bar
   - Filter by category/status
   - Click Play/View to preview
   - Click Edit to modify
   - Click Delete to remove

4. **Audio-Specific Features**
   - Monitor transcription status
   - Retry failed transcriptions
   - Upload custom transcript files
   - Add tags for better organization

5. **PDF-Specific Features**
   - Add comprehensive case details
   - Include court information
   - Tag with keywords
   - Add judge names
   - Write case summaries

## Color Scheme

### Light Mode
- Background: Gray-50
- Cards: White with hover shadow
- Text: Gray-900
- Accents: Blue-500

### Dark Mode
- Background: Gray-950
- Cards: Gray-900 with hover shadow
- Text: White
- Accents: Blue-400

## Technical Details

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast)
- **File Upload**: FormData with multipart/form-data
- **State Management**: React useState/useEffect

## Notes

- All file uploads use FormData for proper multipart handling
- Audio files trigger automatic transcription on upload
- PDF metadata includes optional legal case information
- Pagination defaults to 10 items per page
- All modals are accessible and keyboard-friendly
- Error handling with user-friendly toast notifications
