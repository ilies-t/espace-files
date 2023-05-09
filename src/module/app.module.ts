import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from '../config/database.config';
import { FileModule } from './file.module';
import { StorageServiceModule } from './storage-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseConfig.getTypeOrm(),
    AuthModule,
    FileModule,
    StorageServiceModule
  ]
})
export class AppModule {}
