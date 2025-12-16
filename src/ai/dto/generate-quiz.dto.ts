import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class GenerateQuizDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsInt()
  @Min(1)
  @Max(50)
  count: number;
}
