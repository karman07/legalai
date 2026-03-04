import { IsNotEmpty, IsString, MinLength, IsEmail, IsOptional } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;

  @IsString()
  @IsOptional()
  idToken?: string;
}
