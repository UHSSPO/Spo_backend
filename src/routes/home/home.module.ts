import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoMarketIndex } from '../../entity/spo_market_index.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpoMarketIndex, SpoStockPriceInfo])],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
