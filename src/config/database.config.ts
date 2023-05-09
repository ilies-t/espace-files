import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../entity/account.entity';
import { FileEntity } from '../entity/file.entity';

export class DatabaseConfig {

  /**
   * Get TypeOrmModule.
   */
  public static getTypeOrm(): DynamicModule {

    return TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
      keepConnectionAlive: true,
      entities: [
        AccountEntity,
        FileEntity
      ]
    });

  }
}