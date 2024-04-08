import { Module } from '@nestjs/common';
import { VirtualService } from './virtual.service';
import { VirtualController } from './virtual.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoUserInvestmentStock } from '../../entity/spo_user_investment_stock.entity';

@Module({
  providers: [VirtualService],
  controllers: [VirtualController],
  imports: [TypeOrmModule.forFeature([SpoUserInvestmentStock])],
})
export class VirtualModule {}
