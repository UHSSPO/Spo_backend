import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spo_User } from '../../entity/spo_user.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Spo_User])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
