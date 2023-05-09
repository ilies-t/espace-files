import { MeDto } from './me.dto';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMyInfosDto extends MeDto {

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(12)
  current_password: string;
}