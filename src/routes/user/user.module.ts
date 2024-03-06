import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoUser } from '../../entity/spo_user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpoUser])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
