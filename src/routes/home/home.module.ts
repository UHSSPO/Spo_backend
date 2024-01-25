import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoMarketIndex } from '../../entity/spo_market_index.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpoMarketIndex])],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
