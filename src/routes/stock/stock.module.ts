import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoMarketIndex } from '../../entity/spo_market_index.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';
import { SpoStockInfo } from '../../entity/spo_stock_info.entity';
import { SpoEnterpriseInfo } from '../../entity/spo_entpr_info.entity';
import { SpoUser } from '../../entity/spo_user.entity';
import { SpoStockRisk } from '../../entity/spo_stock_risk.entity';
import { SpoEnterpriseScore } from '../../entity/spo_entpr_scor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpoMarketIndex,
      SpoStockPriceInfo,
      SpoStockInfo,
      SpoEnterpriseInfo,
      SpoUser,
    ]),
  ],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
