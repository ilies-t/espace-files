import { IsEmail, IsNotEmpty } from 'class-validator';

export class MeDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  full_name: string;
}