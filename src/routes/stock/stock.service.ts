import { Injectable } from '@nestjs/common';
import {
  MarketIndexResDto,
  RecommendStockInfo,
  ThemeStockInfo,
  UpdateInterestStock,
} from './dto/res.dto';
import { DataSource, Repository } from 'typeorm';
import { SpoMarketIndex } from '../../entity/spo_market_index.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SpoEnterpriseScore } from '../../entity/spo_entpr_scor.entity';
import { SpoEnterpriseCategory } from '../../entity/spo_entpr_categr.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';
import { SpoStockInfo } from '../../entity/spo_stock_info.entity';
import { SpoInterestStock } from '../../entity/spo_interest_stock.entity';
import { SpoStockView } from '../../entity/spo_stock_view.entity';
import { orderBy } from 'lodash';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(SpoMarketIndex)
    private marketIndexRepository: Repository<SpoMarketIndex>,

    @InjectRepository(SpoStockInfo)
    private stockInfoRepository: Repository<SpoStockInfo>,

    @InjectRepository(SpoStockPriceInfo)
    private stockPriceInfoRepository: Repository<SpoStockPriceInfo>,

    private dataSource: DataSource,
  ) {}
  async getStockInfo(stockInfoSequence: number): Promise<SpoStockInfo> {
    const stockInfo = await this.stockInfoRepository
      .createQueryBuilder('SSI')
      .leftJoinAndSelect('SSI.priceInfo', 'stockPriceInfo')
      .leftJoinAndSelect('SSI.summFinaInfo', 'summFinaInfo')
      .leftJoinAndSelect('SSI.incoInfo', 'incoInfo')
      .leftJoinAndSelect('SSI.enterpriseCategories', 'enterpriseCategories')
      .where('SSI.stockInfoSequence = :stockInfoSequence', {
        stockInfoSequence,
      })
      .getOne();
    await this.dataSource.transaction(async (manager) => {
      const stockView = await manager.findOne(SpoStockView, {
        where: { stockInfoSequence: stockInfoSequence },
      });

      await manager.update(
        SpoStockView,
        { stockInfoSequence: stockInfoSequence },
        { view: stockView.view + 1 },
      );
    });

    return stockInfo;
  }

  async getHomeMarketIndex(): Promise<MarketIndexResDto[]> {
    return await this.marketIndexRepository.find();
  }

  async getShortInvestRecommend(user): Promise<RecommendStockInfo[]> {
    const userSeq = user ? user.userSequence : 0;
    const shortInvestResult: RecommendStockInfo[] =
      await this.stockPriceInfoRepository
        .createQueryBuilder('SSPI')
        .select([
          'SEC.STK_INFO_SEQ as stockInfoSequence',
          'SSPI.ITMS_NM as itmsNm',
          'SSPI.CLPR as clpr',
          'SSPI.FLT_RT as fltRt',
          'SSPI.TRQU as trqu',
          'SSPI.MRKT_TOT_AMT as mrktTotAmt',
          `(SELECT IF(COUNT(*) > 0, 'Y', 'N')
          FROM SPO_INTERST_STK SIS
          INNER JOIN SPO_STK_INFO SSI on SIS.STK_INFO_SEQ = SSI.STK_INFO_SEQ
          WHERE SIS.USR_SEQ = ${userSeq} AND SSI.STK_INFO_SEQ = SEC.STK_INFO_SEQ) as interestStockYn`,
        ])
        .innerJoin(
          SpoEnterpriseScore,
          'SEC',
          'SEC.STK_INFO_SEQ = SSPI.STK_INFO_SEQ',
        )
        .innerJoin(
          SpoEnterpriseCategory,
          'SECT',
          'SECT.ENTPR_CATEGO_SEQ = SEC.ENTPR_CATEGO_SEQ',
        )
        .where('SEC.RAT = :rating', { rating: 'A' })
        .orderBy('SEC.TOTL_SCOR', 'DESC')
        .limit(5)
        .getRawMany();

    return shortInvestResult;
  }

  async getLongInvestRecommend(user): Promise<RecommendStockInfo[]> {
    const userSeq = user ? user.userSequence : 0;
    const longInvestResult: RecommendStockInfo[] =
      await this.stockPriceInfoRepository
        .createQueryBuilder('SSPI')
        .select([
          'SEC.STK_INFO_SEQ as stockInfoSequence',
          'SSPI.ITMS_NM as itmsNm',
          'SSPI.CLPR as clpr',
          'SSPI.FLT_RT as fltRt',
          'SSPI.TRQU as trqu',
          'SSPI.MRKT_TOT_AMT as mrktTotAmt',
          `(SELECT IF(COUNT(*) > 0, 'Y', 'N')
          FROM SPO_INTERST_STK SIS
          INNER JOIN SPO_STK_INFO SSI on SIS.STK_INFO_SEQ = SSI.STK_INFO_SEQ
          WHERE SIS.USR_SEQ = ${userSeq} AND SSI.STK_INFO_SEQ = SEC.STK_INFO_SEQ) as interestStockYn`,
        ])
        .innerJoin(
          SpoEnterpriseScore,
          'SEC',
          'SEC.STK_INFO_SEQ = SSPI.STK_INFO_SEQ',
        )
        .innerJoin(
          SpoEnterpriseCategory,
          'SECT',
          'SECT.ENTPR_CATEGO_SEQ = SEC.ENTPR_CATEGO_SEQ',
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
        .limit(6)
        .getRawMany();

    return popularStockResult;
  }

  async updateInterestStock(reqBody, req): Promise<UpdateInterestStock> {
    let interestStockYn = 'N';
    await this.dataSource.transaction(async (mangaer) => {
      const interestStock = new SpoInterestStock();
      const findInterestStock = await mangaer.findOne(SpoInterestStock, {
        where: {
          stockInfoSequence: reqBody.stockInfoSequence,
          userSequence: req.user.userSequence,
        },
      });
      if (findInterestStock) {
        await mangaer.delete(
          SpoInterestStock,
          findInterestStock.interestSequence,
        );
        interestStockYn = 'N';
      } else {
        interestStock.stockInfoSequence = reqBody.stockInfoSequence;
        interestStock.userSequence = req.user.userSequence;
        await mangaer.save(SpoInterestStock, interestStock);
        interestStockYn = 'Y';
      }
    });
    return { interestStockYn: interestStockYn };
  }

  async getThemeStockInfo(): Promise<ThemeStockInfo> {
    const highViews: RecommendStockInfo[] = await this.stockInfoRepository
      .createQueryBuilder('SSI')
      .select([
        'SSI.STK_INFO_SEQ as stockInfoSequence',
        'SSI.ITMS_NM as itmsNm',
        'SSPI.CLPR as clpr',
        'SSPI.FLT_RT as fltRt',
        'SSPI.TRQU as trqu',
        'SSPI.MRKT_TOT_AMT as mrktTotAmt',
      ])
      .innerJoin(
        SpoStockPriceInfo,
        'SSPI',
        'SSI.STK_INFO_SEQ = SSPI.STK_INFO_SEQ',
      )
      .innerJoin(SpoStockView, 'SSV', 'SSI.STK_INFO_SEQ = SSV.STK_INFO_SEQ')
      .where('SSI.TRAD_SUSPD_YN = :tradeSuspendYn', { tradeSuspendYn: 'N' })
      .orderBy('SSV.VIEW', 'DESC')
      .limit(5)
      .getRawMany();

    const increaseStock: RecommendStockInfo[] = await this.stockInfoRepository
      .createQueryBuilder('SSI')
      .select([
        'SSI.STK_INFO_SEQ as stockInfoSequence',
        'SSI.ITMS_NM as itmsNm',
        'SSPI.CLPR as clpr',
        'SSPI.FLT_RT as fltRt',
        'SSPI.TRQU as trqu',
        'SSPI.MRKT_TOT_AMT as mrktTotAmt',
      ])
      .innerJoin(
        SpoStockPriceInfo,
        'SSPI',
        'SSI.STK_INFO_SEQ = SSPI.STK_INFO_SEQ',
      )
      .where('SSI.TRAD_SUSPD_YN = :tradeSuspendYn', { tradeSuspendYn: 'N' })
      .orderBy('SSPI.FLT_RT', 'DESC')
      .limit(5)
      .getRawMany();

    const declineStock: RecommendStockInfo[] = await this.stockInfoRepository
      .createQueryBuilder('SSI')
      .select([
        'SSI.STK_INFO_SEQ as stockInfoSequence',
        'SSI.ITMS_NM as itmsNm',
        'SSPI.CLPR as clpr',
        'SSPI.FLT_RT as fltRt',
        'SSPI.TRQU as trqu',
        'SSPI.MRKT_TOT_AMT as mrktTotAmt',
      ])
      .innerJoin(
        SpoStockPriceInfo,
        'SSPI',
        'SSI.STK_INFO_SEQ = SSPI.STK_INFO_SEQ',
      )
      .where('SSI.TRAD_SUSPD_YN = :tradeSuspendYn', { tradeSuspendYn: 'N' })
      .orderBy('SSPI.FLT_RT', 'ASC')
      .limit(5)
      .getRawMany();

    return {
      highViews: highViews,
      increaseStock: increaseStock,
      declineStock: declineStock,
    };
  }
}
