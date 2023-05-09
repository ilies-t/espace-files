import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../entity/file.entity';
import { JwtUtil } from '../util/jwt.util';
import { EthereumService } from '../service/ethereum.service';
import { StorageServiceService } from '../service/storage-service.service';
import { StorageServiceController } from '../controller/storage-service.controller';
import { AccountEntity } from '../entity/account.entity';
import { StorageServiceRepository } from '../repository/storage-service.repository';
import { FileService } from '../service/file.service';
import { FileRepository } from '../repository/file.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      FileEntity,
      FileRepository,
      StorageServiceRepository
    ])
  ],
  controllers: [StorageServiceController],
  providers: [
    StorageServiceService,
    JwtUtil,
    FileService,
    EthereumService
  ],
})
export class StorageServiceModule {}