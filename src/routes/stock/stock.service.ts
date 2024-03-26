import { Injectable } from '@nestjs/common';
import {
  HomeStockInfo,
  MarketIndexResDto,
  SearchStockInfo,
  StockInfoResDto,
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
import { IUserInterface } from '../../common/interface/user.interface';
import { SpoEnterpriseInfo } from '../../entity/spo_entpr_info.entity';
import axios from 'axios';
import OpenApi from '../../common/openApi/openApi';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StockService {
  constructor(
    private configService: ConfigService,

    @InjectRepository(SpoMarketIndex)
    private marketIndexRepository: Repository<SpoMarketIndex>,

    @InjectRepository(SpoStockInfo)
    private stockInfoRepository: Repository<SpoStockInfo>,

    @InjectRepository(SpoEnterpriseInfo)
    private enterpriseInfoRepository: Repository<SpoEnterpriseInfo>,

    @InjectRepository(SpoStockPriceInfo)
    private stockPriceInfoRepository: Repository<SpoStockPriceInfo>,

    private dataSource: DataSource,
  ) {}
  async getAllStock(): Promise<SearchStockInfo[]> {
    return await this.stockInfoRepository
      .createQueryBuilder('SSI')
      .select([
        'SSI.STK_INFO_SEQ as stockInfoSequence',
        'SSI.ITMS_NM as itmsNm',
      ])
      .where('SSI.TRAD_SUSPD_YN = :suspend AND SSI.BAD_DATA = :badData', {
        suspend: 'N',
        badData: 'N',
      })
      .getRawMany();
  }

  async getStockInfo(stockInfoSequence: number): Promise<StockInfoResDto> {
    let pastLongRate = 0;
    let pastShortRate = 0;
    const enterpriseInfo = await this.enterpriseInfoRepository.findOne({
      where: {
        stockInfoSequence: stockInfoSequence,
      },
    });

    if (!enterpriseInfo) {
      await this.dataSource.transaction(async (manager) => {
        const stockInfo = await manager.findOne(SpoStockInfo, {
          where: { stockInfoSequence: stockInfoSequence },
        });

        if (stockInfo) {
          const newEnterpriseInfo = new SpoEnterpriseInfo();
          const enterpriseInfoRes = await axios.get(
            `${
              OpenApi.GetEnterpriseInfoService
            }?serviceKey=${this.configService.get<string>(
              'GET_KRX_LIST_INFO_KEY',
            )}&resultType=${this.configService.get<string>(
              'RESULT_TYPE',
            )}&pageNo=${this.configService.get<string>(
              'PAGE_NO',
            )}&numOfRows=1&crno=${stockInfo.crno}`,
          );

          newEnterpriseInfo.stockInfoSequence = stockInfo.stockInfoSequence;
          newEnterpriseInfo.crno = stockInfo.crno;
          newEnterpriseInfo.corpNm =
            enterpriseInfoRes.data?.response?.body?.items?.item[0].corpNm;
          newEnterpriseInfo.enpRprFnm =
            enterpriseInfoRes.data?.response?.body?.items?.item[0].enpRprFnm;
          newEnterpriseInfo.enpBsadr =
            enterpriseInfoRes.data?.response?.body?.items?.item[0].enpBsadr;
          newEnterpriseInfo.enpHmpgUrl =
            enterpriseInfoRes.data?.response?.body?.items?.item[0].enpHmpgUrl;
          newEnterpriseInfo.enpTlno =
            enterpriseInfoRes.data?.response?.body?.items?.item[0].enpTlno;
          newEnterpriseInfo.enpEstbDt =
            enterpriseInfoRes.data?.response?.body?.items?.item[0].enpEstbDt;
          newEnterpriseInfo.enpEmpeCnt =
            enterpriseInfoRes.data?.response?.body?.items?.item[0].enpEmpeCnt;
          newEnterpriseInfo.enpMainBizNm =
            enterpriseInfoRes.data?.response?.body?.items?.item[0].enpMainBizNm;

          await manager.save(SpoEnterpriseInfo, newEnterpriseInfo);
        }
      });
    }

    const stockInfo: SpoStockInfo = await this.stockInfoRepository
      .createQueryBuilder('SSI')
      .leftJoinAndSelect('SSI.priceInfo', 'stockPriceInfo')
      .leftJoinAndSelect('SSI.prc15tnMonInfo', 'prc15tnMonInfo')
      .leftJoinAndSelect('SSI.summFinaInfo', 'summFinaInfo')
      .leftJoinAndSelect('SSI.incoInfo', 'incoInfo')
      .leftJoinAndSelect('SSI.enterpriseCategories', 'enterpriseCategories')
      .leftJoinAndSelect('SSI.enterpriseInfo', 'enterpriseInfo')
      .leftJoinAndSelect('SSI.prcYearInfo', 'prcYearInfo')
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

    if (stockInfo.priceInfo.mrktTotAmt >= 10000000000000) {
      pastLongRate = parseFloat(
        (
          ((stockInfo.priceInfo.clpr - stockInfo.prcYearInfo.clpr) /
            stockInfo.prcYearInfo.clpr) *
          100
        ).toFixed(2),
      );
    } else {
      pastShortRate = parseFloat(
        (
          ((stockInfo.priceInfo.clpr -
            stockInfo.prc15tnMonInfo[stockInfo.prc15tnMonInfo.length - 1]
              .clpr) /
            stockInfo.prc15tnMonInfo[stockInfo.prc15tnMonInfo.length - 1]
              .clpr) *
          100
        ).toFixed(2),
      );
    }

    return {
      ...stockInfo,
      pastLongRate,
      pastShortRate,
    };
  }

  async getHomeMarketIndex(): Promise<MarketIndexResDto[]> {
    return await this.marketIndexRepository.find();
  }

  async getShortInvestRecommend(user): Promise<HomeStockInfo[]> {
    const userSeq = user ? user.userSequence : 0;
    return await this.stockPriceInfoRepository
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
      .where('SEC.RAT = :rating AND  SSPI.MRKT_TOT_AMT < :amount', {
        rating: 'A',
        amount: 10000000000000,
      })
      .orderBy('SEC.TOTL_SCOR', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getLongInvestRecommend(user: IUserInterface): Promise<HomeStockInfo[]> {
    const userSeq = user ? user.userSequence : 0;
    return await this.stockPriceInfoRepository
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
  }

  async getLongInvestRecommendAll(
    user: IUserInterface,
  ): Promise<HomeStockInfo[]> {
    const userSeq = user ? user.userSequence : 0;
    return await this.stockPriceInfoRepository
      .createQueryBuilder('SSPI')
      .select([
        'SEC.STK_INFO_SEQ as stockInfoSequence',
        'SSPI.ITMS_NM as itmsNm',
        'SSPI.CLPR as clpr',
        'SSPI.FLT_RT as fltRt',
        'SSPI.TRQU as trqu',
        'SSPI.MRKT_TOT_AMT as mrktTotAmt',
        'SEC.RAT as rating',
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
      .where('SSPI.MRKT_TOT_AMT > :amount', {
        amount: 10000000000000,
      })
      .orderBy('SEC.TOTL_SCOR', 'DESC')
      .getRawMany();
  }

  async getShortInvestRecommendAll(user): Promise<HomeStockInfo[]> {
    const userSeq = user ? user.userSequence : 0;
    return await this.stockPriceInfoRepository
      .createQueryBuilder('SSPI')
      .select([
        'SEC.STK_INFO_SEQ as stockInfoSequence',
        'SSPI.ITMS_NM as itmsNm',
        'SSPI.CLPR as clpr',
        'SSPI.FLT_RT as fltRt',
        'SSPI.TRQU as trqu',
        'SSPI.MRKT_TOT_AMT as mrktTotAmt',
        'SEC.RAT as rating',
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
      .where('SSPI.MRKT_TOT_AMT < :amount', {
        amount: 10000000000000,
      })
      .orderBy('SEC.TOTL_SCOR', 'DESC')
      .getRawMany();
  }

  async getPopularStockInfo(user: IUserInterface): Promise<HomeStockInfo[]> {
    const userSeq = user ? user.userSequence : 0;
    const popularStockResult: HomeStockInfo[] =
      await this.stockPriceInfoRepository
        .createQueryBuilder('SSPI')
        .select([
          'SSPI.STK_INFO_SEQ as stockInfoSequence',
          'SSPI.ITMS_NM as itmsNm',
          'SSPI.CLPR as clpr',
          'SSPI.FLT_RT as fltRt',
          'SSPI.TRQU as trqu',
          'SSPI.MRKT_TOT_AMT as mrktTotAmt',
          `(SELECT IF(COUNT(*) > 0, 'Y', 'N')
          FROM SPO_INTERST_STK SIS
          WHERE SIS.USR_SEQ = ${userSeq} AND SSPI.STK_INFO_SEQ = SIS.STK_INFO_SEQ) as interestStockYn`,
        ])
        .innerJoin(SpoStockInfo, 'SSI', 'SSPI.STK_INFO_SEQ = SSI.STK_INFO_SEQ')
        .where('SSI.TRAD_SUSPD_YN = :tradeSuspendYn', { tradeSuspendYn: 'N' })
        .orderBy('SSPI.TRQU', 'DESC')
        .limit(6)
        .getRawMany();

    return popularStockResult;
  }

  async updateInterestStock(
    reqBody,
    user: IUserInterface,
  ): Promise<UpdateInterestStock> {
    let interestStockYn = 'N';
    await this.dataSource.transaction(async (mangaer) => {
      const interestStock = new SpoInterestStock();
      const findInterestStock = await mangaer.findOne(SpoInterestStock, {
        where: {
          stockInfoSequence: reqBody.stockInfoSequence,
          userSequence: user.userSequence,
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
        interestStock.userSequence = user.userSequence;
        await mangaer.save(SpoInterestStock, interestStock);
        interestStockYn = 'Y';
      }
    });
    return { interestStockYn: interestStockYn };
  }

  async getMyInterestStock(user: IUserInterface): Promise<HomeStockInfo[]> {
    const userSeq = user ? user.userSequence : 0;
    return await this.stockPriceInfoRepository
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
      .innerJoin(SpoInterestStock, 'SIS', 'SIS.STK_INFO_SEQ = SSI.STK_INFO_SEQ')
      .where(`SIS.USR_SEQ = ${userSeq}`)
      .orderBy('SIS.UPDT_AT', 'ASC')
      .limit(5)
      .getRawMany();
  }

  async getThemeStockInfo(): Promise<ThemeStockInfo> {
    const highViews: HomeStockInfo[] = await this.stockInfoRepository
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

    const increaseStock: HomeStockInfo[] = await this.stockInfoRepository
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

    const declineStock: HomeStockInfo[] = await this.stockInfoRepository
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
