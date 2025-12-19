import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckAnswerDto {
  @IsString()
  question: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  totalMarks: number;

  @IsOptional()
  @IsString()
  gradingCriteria?: string;
}