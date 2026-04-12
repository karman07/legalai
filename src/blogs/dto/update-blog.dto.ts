import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
