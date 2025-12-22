# Audio File Issues - Troubleshooting Guide

## 🚨 Current Issue
The database contains references to audio files that don't exist on the filesystem:
- Database URL: `/uploads/audio/section-0-englishAudio-1766376924036-197058876.opus`
- File Status: **NOT FOUND** (404 error)

## 🔍 Root Cause Analysis

### Files Referenced in Database (Missing):
- `section-0-englishAudio-1766376924036-197058876.opus`
- `section-0-hindiAudio-1766376924042-610571221.opus`
- `section-0-easyEnglishAudio-1766376924043-715194595.opus`
- `section-0-easyHindiAudio-1766376924046-989723544.opus`

### Files Actually Present:
- `section-0-englishAudio-1766375199530-736806457.opus`
- `section-0-hindiAudio-1766375199532-174470964.opus`
- `section-0-easyEnglishAudio-1766375199535-349528883.opus`

## 🛠️ Solutions

### Option 1: Re-upload Audio Files (Recommended)
1. Use the admin panel to update the lesson
2. Upload new audio files for all sections/subsections
3. This will create new files and update database references

### Option 2: Manual Database Fix
Update the database record to point to existing files:

```javascript
// Update the lesson in MongoDB
db.audiolessons.updateOne(
  { "_id": ObjectId("6948bf99bfa177d01362c346") },
  {
    $set: {
      "sections.0.englishAudio.url": "/uploads/audio/section-0-englishAudio-1766375199530-736806457.opus",
      "sections.0.hindiAudio.url": "/uploads/audio/section-0-hindiAudio-1766375199532-174470964.opus",
      "sections.0.easyEnglishAudio.url": "/uploads/audio/section-0-easyEnglishAudio-1766375199535-349528883.opus",
      "sections.0.easyHindiAudio.url": "/uploads/audio/section-0-easyHindiAudio-1766375199537-987922852.opus"
    }
  }
)
```

### Option 3: Add File Validation
Add a validation endpoint to check file existence before serving:

```typescript
@Get('validate/:id')
async validateAudioFiles(@Param('id') id: string) {
  const lesson = await this.audioLessonsService.findOne(id);
  const missingFiles = [];
  
  // Check section audio files
  for (const section of lesson.sections || []) {
    if (section.englishAudio?.url) {
      const filePath = path.join(process.cwd(), section.englishAudio.url);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(section.englishAudio.url);
      }
    }
    // Check other audio variants...
  }
  
  return { missingFiles, totalMissing: missingFiles.length };
}
```

## 🔧 Prevention Measures

### 1. Atomic File Operations
Ensure file upload and database update happen atomically:

```typescript
// Save file first
const savedFile = await this.saveAudioFile(file);

try {
  // Update database
  await this.updateDatabase(lessonId, savedFile);
} catch (error) {
  // Rollback: delete the saved file
  await this.deleteFile(savedFile.path);
  throw error;
}
```

### 2. File Existence Middleware
Add middleware to check file existence before serving:

```typescript
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(process.cwd(), 'uploads', req.path);
  if (fs.existsSync(filePath)) {
    next();
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});
```

### 3. Cleanup Job
Add a scheduled job to clean up orphaned files and fix database references.

## 🚀 Quick Fix Steps

1. **Test Static Serving**: Visit `http://localhost:3000/uploads/audio/test.txt`
2. **Re-upload Files**: Use admin panel to update lesson with new audio files
3. **Verify Fix**: Check that new URLs work in browser
4. **Update Frontend**: Ensure frontend handles 404 errors gracefully

## 📝 File Upload Best Practices

1. **Validate Upload**: Check file was saved successfully
2. **Atomic Operations**: Update database only after file is saved
3. **Error Handling**: Clean up files if database update fails
4. **File Validation**: Check file exists before serving
5. **Backup Strategy**: Keep backups of uploaded files