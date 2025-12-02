import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { RegistrationType, UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsNotEmpty()
  @IsEnum(RegistrationType)
  registrationType: RegistrationType;

  @ValidateIf(o => o.registrationType === RegistrationType.INSTITUTE)
  @IsNotEmpty({ message: 'Institute ID is required for institute registration' })
  @IsString()
  instituteId?: string;

  @IsOptional()
  @IsString()
  instituteName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
