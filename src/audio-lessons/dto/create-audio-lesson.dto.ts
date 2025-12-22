import { IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min, IsUrl, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { VALID_CATEGORY_IDS } from '../../common/enums/audio-lesson-category.enum';

export class AudioSubsectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  hindiText?: string;

  @IsOptional()
  @IsString()
  englishText?: string;

  @IsOptional()
  @IsString()
  easyHindiText?: string;

  @IsOptional()
  @IsString()
  easyEnglishText?: string;

  @IsOptional()
  hindiAudio?: any;

  @IsOptional()
  englishAudio?: any;

  @IsOptional()
  easyHindiAudio?: any;

  @IsOptional()
  easyEnglishAudio?: any;
}

export class AudioSectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  hindiText?: string;

  @IsOptional()
  @IsString()
  englishText?: string;

  @IsOptional()
  @IsString()
  easyHindiText?: string;

  @IsOptional()
  @IsString()
  easyEnglishText?: string;

  // Audio files for each text variant
  @IsOptional()
  hindiAudio?: any;

  @IsOptional()
  englishAudio?: any;

  @IsOptional()
  easyHindiAudio?: any;

  @IsOptional()
  easyEnglishAudio?: any;

  // Subsections
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AudioSubsectionDto)
  subsections?: AudioSubsectionDto[];
}

export class CreateAudioLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  headTitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(VALID_CATEGORY_IDS, { message: 'Invalid category. Must be one of: ' + VALID_CATEGORY_IDS.join(', ') })
  category?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Audio URLs (if providing URLs instead of files)
  @IsOptional()
  @IsString()
  englishAudioUrl?: string;

  @IsOptional()
  @IsString()
  hindiAudioUrl?: string;

  // Admin-provided transcriptions
  @IsOptional()
  @IsString()
  englishTranscription?: string;

  @IsOptional()
  @IsString()
  hindiTranscription?: string;

  @IsOptional()
  @IsString()
  easyEnglishTranscription?: string;

  @IsOptional()
  @IsString()
  easyHindiTranscription?: string;

  // Sections with timestamps and texts
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AudioSectionDto)
  sections?: AudioSectionDto[];

  // Legacy fields for backward compatibility
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @IsInt()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsString()
  transcript?: string;

  // These will be set by the controller after file upload
  audioUrl?: string;
  fileName?: string;
  fileSize?: number;
}
