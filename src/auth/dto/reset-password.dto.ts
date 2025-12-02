import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
