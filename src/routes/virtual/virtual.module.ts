import { Module } from '@nestjs/common';
import { VirtualService } from './virtual.service';
import { VirtualController } from './virtual.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoUserInvestmentStock } from '../../entity/spo_user_investment_stock.entity';
import { SpoUserInvestment } from '../../entity/spo_user_investment.entity';

@Module({
  providers: [VirtualService],
  controllers: [VirtualController],
  imports: [
    TypeOrmModule.forFeature([SpoUserInvestmentStock, SpoUserInvestment]),
  ],
})
export class VirtualModule {}
