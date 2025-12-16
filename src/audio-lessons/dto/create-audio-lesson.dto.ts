import { IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { VALID_CATEGORY_IDS } from '../../common/enums/audio-lesson-category.enum';

export class CreateAudioLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

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
