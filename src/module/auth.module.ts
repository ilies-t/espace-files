import { Module } from '@nestjs/common';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../entity/account.entity';
import { AuthRepository } from '../repository/auth.repository';
import { JwtUtil } from '../util/jwt.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      AuthRepository
    ])
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtUtil
  ],
})
export class AuthModule {}
