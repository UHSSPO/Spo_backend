import { Injectable } from '@nestjs/common';
import { MarketIndexResDto } from './dto/res.dto';
import { Repository } from 'typeorm';
import { SpoMarketIndex } from '../../entity/spo_market_index.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(SpoMarketIndex)
    private marketIndexRepository: Repository<SpoMarketIndex>,
  ) {}
  async getHomeMarketIndex(): Promise<MarketIndexResDto[]> {
    return await this.marketIndexRepository.find();
  }
}
