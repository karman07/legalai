# Custom PDF Viewer Setup

## Installation

Install the PDF.js library for text extraction:

```bash
npm install pdfjs-dist
```

## Features

The custom PDF viewer includes:

1. **Text Selection & Copy**: Select any text in the PDF and copy it to clipboard
2. **Note Taking**: Add notes linked to selected text
3. **Persistent Storage**: Notes are saved in localStorage
4. **Clean Interface**: Full-screen viewer with side panel for notes

## Usage

Click "View Document" on any PDF card to open the custom viewer.

## Future Enhancements

For production, integrate full PDF.js rendering:
- Page-by-page navigation
- Zoom controls
- Search within PDF
- Highlight annotations
