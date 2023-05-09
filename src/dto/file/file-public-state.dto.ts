import { IsBoolean, IsUUID } from 'class-validator';

export class FilePublicStateDto {
  @IsUUID()
  id: string;

  @IsBoolean()
  is_public: boolean;
}