import { Module } from '@nestjs/common';
import { EthereumService } from '../service/ethereum.service';
import { FileController } from '../controller/file.controller';
import { FileService } from '../service/file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../entity/file.entity';
import { FileRepository } from '../repository/file.repository';
import { JwtUtil } from '../util/jwt.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FileEntity,
      FileRepository
    ])
  ],
  controllers: [FileController],
  providers: [
    FileService,
    JwtUtil,
    EthereumService
  ],
})
export class FileModule {}
