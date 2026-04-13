import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateResourceDto {
  @IsOptional()
  @IsString()
  kind?: 'resource' | 'study-material';

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
