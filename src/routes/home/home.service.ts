import { Injectable } from '@nestjs/common';
import { MarketIndexResDto, RecommendStockInfo } from './dto/res.dto';
import { Repository } from 'typeorm';
import { SpoMarketIndex } from '../../entity/spo_market_index.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SpoEnterpriseScore } from '../../entity/spo_entpr_scor.entity';
import { SpoEnterpriseCategory } from '../../entity/spo_entpr_categr.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';
import { SpoStockInfo } from '../../entity/spo_stock_info.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(SpoMarketIndex)
    private marketIndexRepository: Repository<SpoMarketIndex>,
    @InjectRepository(SpoEnterpriseScore)
    private enterpriseScoreRepository: Repository<SpoEnterpriseScore>,
    @InjectRepository(SpoStockPriceInfo)
    private stockPriceInfoRepository: Repository<SpoStockPriceInfo>,
  ) {}
  async getHomeMarketIndex(): Promise<MarketIndexResDto[]> {
    return await this.marketIndexRepository.find();
  }

  async getShortInvestRecommend(): Promise<RecommendStockInfo[]> {
    const shortInvestResult: RecommendStockInfo[] =
      await this.enterpriseScoreRepository
        .createQueryBuilder('SEC')
        .select([
          'SEC.STK_INFO_SEQ as stockInfoSequence',
          'SSPI.ITMS_NM as itmsNm',
          'SSPI.CLPR as clpr',
          'SSPI.FLT_RT as fltRt',
          'SSPI.TRQU as trqu',
          'SSPI.MRKT_TOT_AMT as mrktTotAmt',
        ])
        .innerJoin(
          SpoEnterpriseCategory,
          'SECT',
          'SECT.ENTPR_CATEGO_SEQ = SEC.ENTPR_CATEGO_SEQ',
        )
        .innerJoin(
          SpoStockPriceInfo,
          'SSPI',
          'SEC.STK_INFO_SEQ = SSPI.STK_INFO_SEQ',
        )
        .where('SEC.RAT = :rating', { rating: 'A' })
        .orderBy('SEC.TOTL_SCOR', 'DESC')
        .limit(5)
        .getRawMany();

    return shortInvestResult;
  }

  async getLongInvestRecommend(): Promise<RecommendStockInfo[]> {
    const longInvestResult: RecommendStockInfo[] =
      await this.enterpriseScoreRepository
        .createQueryBuilder('SEC')
        .select([
          'SEC.STK_INFO_SEQ as stockInfoSequence',
          'SSPI.ITMS_NM as itmsNm',
          'SSPI.CLPR as clpr',
          'SSPI.FLT_RT as fltRt',
          'SSPI.TRQU as trqu',
          'SSPI.MRKT_TOT_AMT as mrktTotAmt',
        ])
        .innerJoin(
          SpoEnterpriseCategory,
          'SECT',
          'SECT.ENTPR_CATEGO_SEQ = SEC.ENTPR_CATEGO_SEQ',
        )
        .innerJoin(
          SpoStockPriceInfo,
          'SSPI',
          'SEC.STK_INFO_SEQ = SSPI.STK_INFO_SEQ',
        )
        .where(
          '(SEC.RAT = :ratingA OR SEC.RAT = :ratingB) AND SSPI.MRKT_TOT_AMT > :amount',
          {
            ratingA: 'A',
            ratingB: 'B',
            amount: 10000000000000,
          },
        )
        .orderBy('SEC.TOTL_SCOR', 'DESC')
        .limit(5)
        .getRawMany();

    return longInvestResult;
  }

  async getPopularStockInfo(): Promise<RecommendStockInfo[]> {
    const popularStockResult: RecommendStockInfo[] =
      await this.stockPriceInfoRepository
        .createQueryBuilder('SSPI')
        .select([
          'SSPI.STK_INFO_SEQ as stockInfoSequence',
          'SSPI.ITMS_NM as itmsNm',
          'SSPI.CLPR as clpr',
          'SSPI.FLT_RT as fltRt',
          'SSPI.TRQU as trqu',
          'SSPI.MRKT_TOT_AMT as mrktTotAmt',
        ])
        .innerJoin(SpoStockInfo, 'SSI', 'SSPI.STK_INFO_SEQ = SSI.STK_INFO_SEQ')
        .where('SSI.TRAD_SUSPD_YN = :tradeSuspendYn', { tradeSuspendYn: 'N' })
        .orderBy('SSPI.TRQU', 'DESC')
        .limit(5)
        .getRawMany();

    return popularStockResult;
  }
}
