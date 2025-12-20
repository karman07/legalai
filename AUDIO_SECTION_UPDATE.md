# Audio Section Schema Update

## Complete Schema Structure

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

### Updated AudioSection Schema
```typescript
@Schema({ _id: false })
export class AudioSection {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  startTime: number; // in seconds

  @Prop({ required: true })
  endTime: number; // in seconds

  // Text variants
  @Prop()
  hindiText?: string;

  @Prop()
  englishText?: string;

  @Prop()
  easyHindiText?: string;

  @Prop()
  easyEnglishText?: string;

  // Audio files for each text variant
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

### AudioLesson Schema (with sections)
```typescript
@Schema({ timestamps: true })
export class AudioLesson {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  // Main audio files
  @Prop({ type: AudioFile })
  englishAudio?: AudioFile;

  @Prop({ type: AudioFile })
  hindiAudio?: AudioFile;

  // Full transcriptions
  @Prop()
  englishTranscription?: string;

  @Prop()
  hindiTranscription?: string;

  @Prop()
  easyEnglishTranscription?: string;

  @Prop()
  easyHindiTranscription?: string;

  // Sections with timestamps, texts, and audio
  @Prop({ type: [AudioSection] })
  sections?: AudioSection[];

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

### Example Section
```json
{
  "title": "Introduction",
  "startTime": 0,
  "endTime": 30,
  "hindiText": "परिचय",
  "englishText": "Introduction", 
  "easyHindiText": "शुरुआत",
  "easyEnglishText": "Start",
  "hindiAudio": {
    "url": "/uploads/audio/intro-hi.mp3",
    "fileName": "intro-hindi.mp3",
    "fileSize": 45000,
    "duration": 15
  },
  "englishAudio": {
    "url": "/uploads/audio/intro-en.mp3", 
    "fileName": "intro-english.mp3",
    "fileSize": 42000,
    "duration": 12
  }
}
```

This enables granular audio-text synchronization for enhanced learning experience.