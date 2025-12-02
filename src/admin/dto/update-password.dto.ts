import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
