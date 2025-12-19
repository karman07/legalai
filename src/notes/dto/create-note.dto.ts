import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NoteReferenceDto {
  @IsString()
  @IsNotEmpty()
  type: string; // 'pdf', 'audio', 'quiz', etc.

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  metadata?: Record<string, any>; // page number, timestamp, etc.
}

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @ValidateNested()
  @Type(() => NoteReferenceDto)
  reference: NoteReferenceDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isBookmarked?: boolean;

  @IsOptional()
  @IsBoolean()
  isFavourite?: boolean;
}