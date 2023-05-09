import { LoginDto } from './login.dto';
import { IsString } from 'class-validator';

export class SignUpDto extends LoginDto {

  @IsString()
  full_name: string;

}