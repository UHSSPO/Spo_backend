import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoUser } from '../../entity/spo_user.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpoUser, SpoStockPriceInfo])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
