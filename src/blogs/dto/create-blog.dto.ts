import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  content: string;

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
