import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class NewFolderDto {

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  parent_id: string;
}