import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoMarketIndex } from '../../entity/spo_market_index.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpoMarketIndex, SpoStockPriceInfo])],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
