import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePdfDto {
  @IsOptional()
  @IsString()
  diary_no?: string;

  @IsOptional()
  @IsString()
  case_no?: string;

  @IsOptional()
  @IsString()
  pet?: string;

  @IsOptional()
  @IsString()
  pet_adv?: string;

  @IsOptional()
  @IsString()
  res_adv?: string;

  @IsOptional()
  @IsString()
  bench?: string;

  @IsOptional()
  @IsString()
  judgement_by?: string;

  @IsOptional()
  @IsDateString()
  judgment_dates?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  file?: string;
}
