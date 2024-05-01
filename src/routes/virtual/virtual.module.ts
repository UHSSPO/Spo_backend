import { Module } from '@nestjs/common';
import { VirtualService } from './virtual.service';
import { VirtualController } from './virtual.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoUserInvestmentStock } from '../../entity/spo_user_investment_stock.entity';
import { SpoUserInvestment } from '../../entity/spo_user_investment.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';

@Module({
  providers: [VirtualService],
  controllers: [VirtualController],
  imports: [
    TypeOrmModule.forFeature([
      SpoUserInvestmentStock,
      SpoUserInvestment,
      SpoStockPriceInfo,
    ]),
  ],
})
export class VirtualModule {}
