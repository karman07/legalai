import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CourtDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['supreme', 'high', 'district'])
  level?: 'supreme' | 'high' | 'district';

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;
}

export class CreatePdfDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Case Law Information
  @IsOptional()
  @IsString()
  caseTitle?: string;

  @IsOptional()
  @IsString()
  caseNumber?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CourtDto)
  court?: CourtDto;

  @IsOptional()
  @IsDateString()
  judgmentDate?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @IsInt()
  @Min(1800)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  citation?: string;

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
  judges?: string[];

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  fullText?: string;

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
  keywords?: string[];

  @IsOptional()
  @IsString()
  category?: string;
}
