import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AiQuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  options: string[];

  @IsInt()
  @Min(0)
  @Max(100)
  correctOptionIndex: number;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class ScoreAiQuizDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AiQuestionDto)
  questions: AiQuestionDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Min(0, { each: true })
  answers: number[];
}
