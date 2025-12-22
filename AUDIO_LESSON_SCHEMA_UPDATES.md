# Audio Lesson Schema Updates - Hierarchical Structure

## Overview
The Audio Lesson module has been updated to support a comprehensive hierarchical structure with independent audio files at each level.

## 🏗️ Schema Architecture

### Hierarchical Structure
```
AudioLesson (Head Title + Title + Description)
├── Only description text (no audio files)
├── Section and subsection counts
└── Multiple Sections
    ├── Section-level audio files (English, Hindi, Easy English, Easy Hindi)
    ├── Section-level text content
    └── Multiple Subsections
        ├── Subsection-level audio files (English, Hindi, Easy English, Easy Hindi)
        └── Subsection-level text content
```

## 📋 Complete Schema Definition

### AudioFile Schema
```typescript
@Schema({ _id: false })
export class AudioFile {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop()
  duration?: number;
}
```

### AudioSubsection Schema
```typescript
@Schema({ _id: false })
export class AudioSubsection {
  @Prop({ required: true })
  title: string;

  // Text content in multiple languages/difficulties
  @Prop()
  hindiText?: string;

  @Prop()
  englishText?: string;

  @Prop()
  easyHindiText?: string;

  @Prop()
  easyEnglishText?: string;

  // Independent audio files for each variant
  @Prop({ type: AudioFile })
  hindiAudio?: AudioFile;

  @Prop({ type: AudioFile })
  englishAudio?: AudioFile;

  @Prop({ type: AudioFile })
  easyHindiAudio?: AudioFile;

  @Prop({ type: AudioFile })
  easyEnglishAudio?: AudioFile;
}
```

### AudioSection Schema
```typescript
@Schema({ _id: false })
export class AudioSection {
  @Prop({ required: true })
  title: string;

  // Text content in multiple languages/difficulties
  @Prop()
  hindiText?: string;

  @Prop()
  englishText?: string;

  @Prop()
  easyHindiText?: string;

  @Prop()
  easyEnglishText?: string;

  // Independent audio files for each variant
  @Prop({ type: AudioFile })
  hindiAudio?: AudioFile;

  @Prop({ type: AudioFile })
  englishAudio?: AudioFile;

  @Prop({ type: AudioFile })
  easyHindiAudio?: AudioFile;

  @Prop({ type: AudioFile })
  easyEnglishAudio?: AudioFile;

  // Multiple subsections within this section
  @Prop({ type: [AudioSubsection] })
  subsections?: AudioSubsection[];

  // Auto-calculated count of subsections
  @Prop({ default: 0 })
  totalSubsections: number;
}
```

### AudioLesson Schema (Main)
```typescript
@Schema({ timestamps: true })
export class AudioLesson {
  @Prop({ required: true })
  title: string;

  @Prop()
  headTitle?: string; // Main topic/category

  @Prop()
  description?: string; // Only description at lesson level

  @Prop({ default: 0 })
  totalSections: number; // Auto-calculated

  @Prop({ default: 0 })
  totalSubsections: number; // Auto-calculated total across all sections

  // Multiple sections with their own content and subsections
  @Prop({ type: [AudioSection] })
  sections?: AudioSection[];

  // Metadata
  @Prop({ enum: VALID_CATEGORY_IDS })
  category?: string;

  @Prop([String])
  tags?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}
```

## 🎯 Key Features

### 1. Multi-Level Audio Support
- **Section Level**: Detailed section-specific audio
- **Subsection Level**: Granular subsection audio
- **No Lesson Level Audio**: Only description text at main level

### 2. Language & Difficulty Variants
Sections and subsections support up to 4 audio variants:
- `englishAudio` - Standard English
- `hindiAudio` - Standard Hindi
- `easyEnglishAudio` - Simplified English
- `easyHindiAudio` - Simplified Hindi

### 3. Automatic Counting
- `totalSections` - Auto-calculated at lesson level
- `totalSubsections` - Auto-calculated total across all sections
- `totalSubsections` per section - Auto-calculated per individual section

### 4. Independent Content
- Each section/subsection can have its own text and audio
- Lesson level only contains description
- Flexible content organization

## 📊 Example Data Structure

### Complete Lesson Example
```json
{
  "_id": "lesson_id",
  "headTitle": "Constitutional Law Fundamentals",
  "title": "Article 14 - Right to Equality",
  "description": "Comprehensive study of Article 14 covering equality before law, equal protection, and reasonable classification principles",
  "totalSections": 2,
  "totalSubsections": 5,
  "category": "constitutional-law",
  
  "sections": [
    {
      "title": "Introduction to Article 14",
      "totalSubsections": 2,
      "englishText": "Article 14 ensures equality before law...",
      "hindiText": "अनुच्छेद 14 कानून के समक्ष समानता सुनिश्चित करता है...",
      
      "englishAudio": {
        "url": "/uploads/audio/section1-en.mp3",
        "fileName": "intro-article14-en.mp3",
        "fileSize": 1024000
      },
      "hindiAudio": {
        "url": "/uploads/audio/section1-hi.mp3",
        "fileName": "intro-article14-hi.mp3",
        "fileSize": 987000
      },
      
      "subsections": [
        {
          "title": "Historical Background",
          "englishText": "The concept originated from British law...",
          "hindiText": "यह अवधारणा ब्रिटिश कानून से उत्पन्न हुई...",
          
          "englishAudio": {
            "url": "/uploads/audio/subsection1-1-en.mp3",
            "fileName": "history-background-en.mp3",
            "fileSize": 512000
          },
          "hindiAudio": {
            "url": "/uploads/audio/subsection1-1-hi.mp3",
            "fileName": "history-background-hi.mp3",
            "fileSize": 487000
          }
        },
        {
          "title": "Constitutional Provisions",
          "englishText": "Article 14 states that the State shall not deny...",
          "hindiText": "अनुच्छेद 14 कहता है कि राज्य इनकार नहीं करेगा...",
          
          "englishAudio": {
            "url": "/uploads/audio/subsection1-2-en.mp3",
            "fileName": "constitutional-provisions-en.mp3",
            "fileSize": 678000
          },
          "hindiAudio": {
            "url": "/uploads/audio/subsection1-2-hi.mp3",
            "fileName": "constitutional-provisions-hi.mp3",
            "fileSize": 645000
          },
          "easyEnglishAudio": {
            "url": "/uploads/audio/subsection1-2-easy-en.mp3",
            "fileName": "constitutional-provisions-easy-en.mp3",
            "fileSize": 567000
          }
        }
      ]
    },
    {
      "title": "Key Principles and Applications",
      "totalSubsections": 3,
      "englishText": "The key principles include equality before law...",
      
      "subsections": [
        {
          "title": "Equality Before Law",
          "englishText": "This principle means that all persons are equal...",
          "englishAudio": {
            "url": "/uploads/audio/subsection2-1-en.mp3",
            "fileName": "equality-before-law-en.mp3",
            "fileSize": 445000
          }
        },
        {
          "title": "Equal Protection of Laws",
          "englishText": "Equal protection ensures that similar cases...",
          "hindiText": "समान संरक्षण सुनिश्चित करता है कि समान मामले...",
          "englishAudio": {
            "url": "/uploads/audio/subsection2-2-en.mp3",
            "fileName": "equal-protection-en.mp3",
            "fileSize": 523000
          },
          "hindiAudio": {
            "url": "/uploads/audio/subsection2-2-hi.mp3",
            "fileName": "equal-protection-hi.mp3",
            "fileSize": 498000
          }
        },
        {
          "title": "Reasonable Classification",
          "englishText": "The doctrine of reasonable classification allows...",
          "englishAudio": {
            "url": "/uploads/audio/subsection2-3-en.mp3",
            "fileName": "reasonable-classification-en.mp3",
            "fileSize": 612000
          }
        }
      ]
    }
  ],
  
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🔄 Content Flow

### 1. Lesson Structure
```
Head Title: "Constitutional Law Fundamentals"
├── Title: "Article 14 - Right to Equality"
├── Description: "Comprehensive study covering equality principles..."
├── Total Sections: 2
├── Total Subsections: 5
└── Sections (Multiple)
```

### 2. Section Structure
```
Section: "Introduction to Article 14"
├── Section Text: English, Hindi, Easy variants
├── Section Audio: English, Hindi, Easy variants
└── Subsections (Multiple)
```

### 3. Subsection Structure
```
Subsection: "Historical Background"
├── Subsection Text: English, Hindi, Easy variants
└── Subsection Audio: English, Hindi, Easy variants
```

## 🎨 UI Implications

### 1. Navigation Structure
- **Breadcrumb**: Head Title > Lesson Title > Section > Subsection
- **Content Tree**: Expandable/collapsible hierarchy
- **Audio Controls**: Independent playback at each level

### 2. Content Display
- **Hierarchical Numbering**: 1, 1.1, 1.2, 2, 2.1, 2.2, etc.
- **Language Switching**: Toggle between English/Hindi at any level
- **Difficulty Selection**: Choose standard or easy versions

### 3. Progress Tracking
- **Multi-level Progress**: Track completion at lesson, section, and subsection levels
- **Granular Analytics**: Detailed usage statistics per content piece
- **Flexible Learning Paths**: Users can consume content in any order

## 🚀 Benefits

### For Content Creators
- **Flexible Organization**: Structure content hierarchically
- **Independent Audio**: Upload audio for specific sections only
- **Multi-language Support**: Provide content in multiple languages
- **Automatic Management**: System handles counting and organization

### For Learners
- **Targeted Learning**: Focus on specific sections/subsections
- **Language Preference**: Choose preferred language at any level
- **Difficulty Adaptation**: Select appropriate difficulty level
- **Flexible Navigation**: Jump to any content piece directly

### For Developers
- **Scalable Architecture**: Supports unlimited nesting
- **Clean Data Model**: Well-structured, maintainable schema
- **Automatic Calculations**: Self-updating counts and metadata
- **Flexible Queries**: Easy to filter and search content

## 📝 Implementation Notes

### Backend Changes Required
- ✅ Schema updated with hierarchical structure
- ✅ DTOs updated to remove time dependencies
- ✅ Service methods handle automatic counting
- ✅ File cleanup includes all nested audio files

### Frontend Considerations
- Hierarchical display components needed
- Multi-level audio player controls
- Language/difficulty selection UI
- Progress tracking for nested content
- Mobile-responsive collapsible sections

This schema provides maximum flexibility for complex educational content while maintaining clean organization and automatic management of metadata.