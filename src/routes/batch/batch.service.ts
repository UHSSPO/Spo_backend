import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isWeekend } from 'date-fns';
import OpenApi from '../../common/openApi/openApi';
import axios from 'axios';
import StringUtil from '../../common/util/StringUtil';
import { ConfigService } from '@nestjs/config';
import {
  IFinaStatInfoRes,
  IIncoStatInfoRes,
  IKrxListedInfoRes,
  IMarketIndexInfoRes,
  IStockPriceInfoRes,
} from '../../common/openApi/interface/openApiInterface';
import _ from 'lodash';
import { DataSource, In } from 'typeorm';
import { SpoStockInfo } from '../../entity/spo_stock_info.entity';
import { SpoSummFinaInfo } from '../../entity/spo_summ_fina_info.entity';
import { SpoIncoInfo } from '../../entity/spo_inco_info.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';
import { SpoStockPrice15thInfo } from '../../entity/spo_stock_price_15th_info.entity';
import { SpoMarketIndex } from '../../entity/spo_market_index.entity';
import { SpoEnterpriseCategory } from '../../entity/spo_entpr_categr.entity';
import { SpoEnterpriseScore } from '../../entity/spo_entpr_scor.entity';
import { BatchCalculator } from '../../common/util/batch/BatchCalculator';
import { SpoStockRisk } from '../../entity/spo_stock_risk.entity';
import { SpoEnterpriseInfo } from '../../entity/spo_entpr_info.entity';
import { SpoStockPriceYearInfo } from '../../entity/spo_stock_price_year_info.entity';
import { SpoUserInvestmentStock } from '../../entity/spo_user_investment_stock.entity';
import { SpoUserInvestment } from '../../entity/spo_user_investment.entity';
// import { SpoUserInvestment } from '../../entity/spo_user_investment.entity';

@Injectable()
export class BatchService implements OnApplicationBootstrap {
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}
  private shouldRunBatch = true;
  private logger = new Logger(BatchService.name);

  private krxListedInfoResData: Array<IKrxListedInfoRes> = [];
  private finaStatInfoResData: Array<IFinaStatInfoRes> = [];
  private incoStataInfoResData: Array<IIncoStatInfoRes> = [];
  private stockPriceInfoResData: Array<IStockPriceInfoRes> = [];
  private stockPrice15thInfoResData: Array<IStockPriceInfoRes> = [];
  private stockPriceYearInfoResData: Array<IStockPriceInfoRes> = [];
  private stockMarketIndexInfoResData: Array<IMarketIndexInfoRes> = [];
  private derivationMarketIndexInfoResData: Array<IMarketIndexInfoRes> = [];

  onApplicationBootstrap() {
    // this.shouldRunBatch =
    //   process.env.NODE_ENV !== 'dev' && !isWeekend(new Date());
    this.shouldRunBatch = true;
  }

  // 상장 종목 정보 조회 배치
  @Cron('15 16 5 * *') // 매달 5일 오후 4시 15분에 실행
  async stockBatchTask() {
    if (this.shouldRunBatch) {
      const basDt = StringUtil.getYesterdayDate();
      const bizYear = '2023';
      try {
        // 주식 시세 정보 호출
        const stockPriceInfoRes: any = await axios.get(
          `${
            OpenApi.GetStockPriceInfoService
          }?serviceKey=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_KEY',
          )}&basDt=${basDt}&resultType=${this.configService.get<string>(
            'RESULT_TYPE',
          )}&pageNo=${this.configService.get<string>(
            'PAGE_NO',
          )}&numOfRows=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_ROW',
          )}&beginMrktTotAmt=${this.configService.get<string>(
            'BEGIN_MRKT_TOT_AMT',
          )}`,
        );
        this.stockPriceInfoResData =
          stockPriceInfoRes.data?.response?.body?.items?.item;

        const krxListedInfoRes: any = await axios.get(
          `${
            OpenApi.GetKrxListedInfoService
          }?serviceKey=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_KEY',
          )}&basDt=${basDt}&resultType=${this.configService.get<string>(
            'RESULT_TYPE',
          )}&pageNo=${this.configService.get<string>(
            'PAGE_NO',
          )}&numOfRows=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_ROW',
          )}`,
        );

        this.krxListedInfoResData =
          krxListedInfoRes.data?.response?.body?.items?.item;

        const response = await axios.get(
          `${
            OpenApi.GetFinaStatInfoService
          }?serviceKey=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_KEY',
          )}&bizYear=${bizYear}&resultType=${this.configService.get<string>(
            'RESULT_TYPE',
          )}&pageNo=${this.configService.get<string>(
            'PAGE_NO',
          )}&numOfRows=130000`,
        );
        this.finaStatInfoResData = response.data?.response?.body?.items?.item;

        if (
          StringUtil.isNotEmpty(this.stockPriceInfoResData) &&
          StringUtil.isNotEmpty(this.krxListedInfoResData) &&
          StringUtil.isNotEmpty(this.finaStatInfoResData)
        ) {
          let filteredDataArray = _.filter(
            this.krxListedInfoResData,
            (krxListItem) =>
              this.stockPriceInfoResData.some(
                (stockPriceItem) =>
                  stockPriceItem.itmsNm === krxListItem.itmsNm,
              ),
          );

          filteredDataArray = _.filter(filteredDataArray, (krxListItem) =>
            this.finaStatInfoResData.some(
              (finaItem) => finaItem.crno === krxListItem.crno,
            ),
          );
          await this.dataSource.transaction(async (manager) => {
            for (const filteredData of filteredDataArray) {
              const stockInfo = new SpoStockInfo();
              stockInfo.basDt = filteredData.basDt;
              stockInfo.crno = filteredData.crno;
              stockInfo.srtnCd = filteredData.srtnCd;
              stockInfo.corpNm = filteredData.corpNm;
              stockInfo.itmsNm = filteredData.itmsNm;
              stockInfo.mrktCtg = filteredData.mrktCtg;

              await manager.upsert(SpoStockInfo, stockInfo, ['crno']);
            }
          });
          await this.getFinaStatInfo();
        } else {
          this.logger.log(
            'Undefined Response from getFinaStatInfo API',
            this.krxListedInfoResData,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error fetching data from stockBatchTask API: ${error}`,
        );
      }
    }
  }

  // 기업 재무제표 배치
  async getFinaStatInfo() {
    if (this.shouldRunBatch) {
      // 공시일자가 3월말에서 4월말 사이라 수동 작업
      const bizYear = '2022';
      try {
        const response = await axios.get(
          `${
            OpenApi.GetFinaStatInfoService
          }?serviceKey=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_KEY',
          )}&bizYear=${bizYear}&resultType=${this.configService.get<string>(
            'RESULT_TYPE',
          )}&pageNo=${this.configService.get<string>(
            'PAGE_NO',
          )}&numOfRows=130000`,
        );
        this.finaStatInfoResData = response.data?.response?.body?.items?.item;

        if (
          StringUtil.isNotEmpty(this.finaStatInfoResData) &&
          _.isArray(this.finaStatInfoResData)
        ) {
          await this.dataSource.transaction(async (manager) => {
            const stockInfos = await manager.find(SpoStockInfo);
            for (const stockInfo of stockInfos) {
              const matchingFinaInfo = this.finaStatInfoResData.find(
                (finaStatInfo) =>
                  finaStatInfo.crno === stockInfo.crno &&
                  finaStatInfo.fnclDcd === '120',
              );

              if (matchingFinaInfo) {
                const finaInfo = new SpoSummFinaInfo();
                finaInfo.stockInfo = stockInfo;
                finaInfo.stockInfoSequence = stockInfo.stockInfoSequence;
                finaInfo.crno = matchingFinaInfo.crno;
                finaInfo.bizYear = matchingFinaInfo.bizYear;
                finaInfo.curCd = matchingFinaInfo.curCd;
                finaInfo.fnclDcd = matchingFinaInfo.fnclDcd;
                finaInfo.fnclDcdNm = matchingFinaInfo.fnclDcdNm;
                finaInfo.enpSaleAmt = matchingFinaInfo.enpSaleAmt;
                finaInfo.enpBzopPft = matchingFinaInfo.enpBzopPft;
                finaInfo.iclsPalClcAmt = matchingFinaInfo.iclsPalClcAmt;
                finaInfo.enpCrtmNpf = matchingFinaInfo.enpCrtmNpf;
                finaInfo.enpTastAmt = matchingFinaInfo.enpTastAmt;
                finaInfo.enpTdbtAmt = matchingFinaInfo.enpTdbtAmt;
                finaInfo.enpTcptAmt = matchingFinaInfo.enpTcptAmt;
                finaInfo.enpCptlAmt = matchingFinaInfo.enpCptlAmt;
                finaInfo.fnclDebtRto = matchingFinaInfo.fnclDebtRto;

                await manager.upsert(SpoSummFinaInfo, finaInfo, ['crno']);
              }
            }
          });
          await this.getIncoStatInfo();
          this.logger.log(`Success SpoSummFinaInfo Update`);
        } else {
          this.logger.log('Undefined Response from getFinaStatInfo API');
        }
      } catch (error) {
        this.logger.error(
          `Error fetching data from getFinaStatInfo API: ${error}`,
        );
      }
    }
  }

  // 손익계산서 배치
  async getIncoStatInfo() {
    if (this.shouldRunBatch) {
      const bizYear = '2022';
      try {
        const response = await axios.get(
          `${
            OpenApi.GetIncoStatInfoService
          }?serviceKey=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_KEY',
          )}&bizYear=${bizYear}&resultType=${this.configService.get<string>(
            'RESULT_TYPE',
          )}&pageNo=${this.configService.get<string>(
            'PAGE_NO',
          )}&numOfRows=${this.configService.get<string>(
            'GET_FINA_STAT_INFO_ROW',
          )}`,
        );
        this.incoStataInfoResData = response.data?.response?.body?.items?.item;

        if (
          StringUtil.isNotEmpty(this.incoStataInfoResData) &&
          _.isArray(this.incoStataInfoResData)
        ) {
          await this.dataSource.transaction(async (manager) => {
            const stockInfos = await manager.find(SpoStockInfo);
            await manager.clear(SpoIncoInfo);

            for (const stockInfo of stockInfos) {
              const matchingIncoInfos = _.filter(
                this.incoStataInfoResData,
                (incoStatInfo) =>
                  incoStatInfo.crno === stockInfo.crno &&
                  incoStatInfo.fnclDcd !== 'PL_ifrs-full_ConsolidatedMember',
              );

              for (const matchingIncoInfo of matchingIncoInfos) {
                const incoInfo = new SpoIncoInfo();
                incoInfo.stockInfo = stockInfo;
                incoInfo.stockInfoSequence = stockInfo.stockInfoSequence;
                incoInfo.crno = matchingIncoInfo.crno;
                incoInfo.bizYear = matchingIncoInfo.bizYear;
                incoInfo.curCD = matchingIncoInfo.curCd;
                incoInfo.fnclDcd = matchingIncoInfo.fnclDcd;
                incoInfo.fnclDcdNm = matchingIncoInfo.fnclDcdNm;
                incoInfo.acitId = matchingIncoInfo.acitId;
                incoInfo.acitNm = matchingIncoInfo.acitNm;
                incoInfo.thqrAcitAmt = matchingIncoInfo.thqrAcitAmt;
                incoInfo.crtmAcitAmt = matchingIncoInfo.crtmAcitAmt;
                incoInfo.lsqtAcitAmt = matchingIncoInfo.lsqtAcitAmt;
                incoInfo.pvtrAcitAmt = matchingIncoInfo.pvtrAcitAmt;
                incoInfo.bpvtrAcitAmt = matchingIncoInfo.bpvtrAcitAmt;

                await manager.save(SpoIncoInfo, incoInfo);
              }
            }
          });
          this.logger.log(`Success SpoIncoInfo Update`);
          await this.deleteEnterpriseInfo();
        } else {
          this.logger.log(
            'Undefined Response from getIncoStatInfo API',
            this.incoStataInfoResData,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error fetching data from getIncoStatInfo API: ${error}`,
        );
      }
    }
  }

  // 주식 시세 정보 배치
  @Cron(CronExpression.EVERY_DAY_AT_3PM) // 매일 3시에 실행
  async getStockPriceInfo() {
    if (this.shouldRunBatch) {
      const basDt = StringUtil.getYesterdayDate();
      try {
        // 주식 시세 정보 호출
        const stockPriceInfoRes: any = await axios.get(
          `${
            OpenApi.GetStockPriceInfoService
          }?serviceKey=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_KEY',
          )}&basDt=${basDt}&resultType=${this.configService.get<string>(
            'RESULT_TYPE',
          )}&pageNo=${this.configService.get<string>(
            'PAGE_NO',
          )}&numOfRows=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_ROW',
          )}`,
        );
        this.stockPriceInfoResData =
          stockPriceInfoRes.data?.response?.body?.items?.item;

        if (
          StringUtil.isNotEmpty(this.stockPriceInfoResData) &&
          _.isArray(this.stockPriceInfoResData)
        ) {
          await this.dataSource.transaction(async (manager) => {
            const stockInfos = await manager.find(SpoStockInfo);
            for (const stockInfo of stockInfos) {
              const matchingStockPriceInfo = this.stockPriceInfoResData.find(
                (stockPriceInfo) =>
                  'A' + stockPriceInfo.srtnCd === stockInfo.srtnCd,
              );

              if (matchingStockPriceInfo) {
                const stockPriceInfo = new SpoStockPriceInfo();
                stockPriceInfo.stockInfo = stockInfo;
                stockPriceInfo.stockInfoSequence = stockInfo.stockInfoSequence;
                stockPriceInfo.srtnCd = matchingStockPriceInfo.srtnCd;
                stockPriceInfo.itmsNm = matchingStockPriceInfo.itmsNm;
                stockPriceInfo.clpr = matchingStockPriceInfo.clpr;
                stockPriceInfo.fltRt = matchingStockPriceInfo.fltRt;
                stockPriceInfo.basDt = matchingStockPriceInfo.basDt;
                stockPriceInfo.vs = matchingStockPriceInfo.vs;
                stockPriceInfo.mkp = matchingStockPriceInfo.mkp;
                stockPriceInfo.hipr = matchingStockPriceInfo.hipr;
                stockPriceInfo.lopr = matchingStockPriceInfo.lopr;
                stockPriceInfo.trqu = matchingStockPriceInfo.trqu;
                stockPriceInfo.trPrc = matchingStockPriceInfo.trPrc;
                stockPriceInfo.lstgStCnt = matchingStockPriceInfo.lstgStCnt;
                stockPriceInfo.mrktTotAmt = matchingStockPriceInfo.mrktTotAmt;

                if (
                  matchingStockPriceInfo.mkp == 0 &&
                  matchingStockPriceInfo.hipr == 0 &&
                  matchingStockPriceInfo.lopr == 0
                ) {
                  stockInfo.tradeSuspendYn = 'Y';
                  await manager.update(
                    SpoStockInfo,
                    { srtnCd: stockInfo.srtnCd },
                    { tradeSuspendYn: stockInfo.tradeSuspendYn },
                  );
                }
                await manager.upsert(SpoStockPriceInfo, stockPriceInfo, [
                  'srtnCd',
                ]);
              }
            }
          });
          this.logger.log(`Success SpoStockPriceInfo Update ${basDt}`);
          await this.getStockPrice15thInfo();
        } else {
          this.logger.log(
            'Undefined Response from getStockPriceInfo API',
            this.stockPriceInfoResData,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error fetching data from getStockPriceInfo API: ${error}`,
        );
      }
    }
  }

  // 15일 주식 시세 정보 배치
  async getStockPrice15thInfo() {
    if (this.shouldRunBatch) {
      const basDt = StringUtil.get15thDate();
      try {
        // 15일 주식 시세 정보 호출
        for (let i = 0; i <= 5; i++) {
          const stockPrice15thInfoRes: any = await axios.get(
            `${
              OpenApi.GetStockPriceInfoService
            }?serviceKey=${this.configService.get<string>(
              'GET_KRX_LIST_INFO_KEY',
            )}&beginBasDt=${basDt}&resultType=${this.configService.get<string>(
              'RESULT_TYPE',
            )}&pageNo=${i}&numOfRows=200000`,
          );
          this.stockPrice15thInfoResData =
            this.stockPrice15thInfoResData.concat(
              stockPrice15thInfoRes.data?.response?.body?.items?.item,
            );
        }
        if (
          StringUtil.isNotEmpty(this.stockPrice15thInfoResData) &&
          _.isArray(this.stockPrice15thInfoResData)
        ) {
          await this.dataSource.transaction(async (manager) => {
            const stockInfos = await manager.find(SpoStockInfo);
            await manager.clear(SpoStockPrice15thInfo);
            for (const stockInfo of stockInfos) {
              const matchingStockPrice15thInfos = _.filter(
                this.stockPrice15thInfoResData,
                (stockPrice15thInfo) =>
                  'A' + stockPrice15thInfo.srtnCd === stockInfo.srtnCd,
              );
              if (matchingStockPrice15thInfos) {
                for (const matchingStockPrice15thInfo of matchingStockPrice15thInfos) {
                  const stockPrice15thInfo = new SpoStockPrice15thInfo();
                  stockPrice15thInfo.stockInfo = stockInfo;
                  stockPrice15thInfo.stockInfoSequence =
                    stockInfo.stockInfoSequence;
                  stockPrice15thInfo.srtnCd = matchingStockPrice15thInfo.srtnCd;
                  stockPrice15thInfo.itmsNm = matchingStockPrice15thInfo.itmsNm;
                  stockPrice15thInfo.clpr = matchingStockPrice15thInfo.clpr;
                  stockPrice15thInfo.fltRt = matchingStockPrice15thInfo.fltRt;
                  stockPrice15thInfo.basDt = matchingStockPrice15thInfo.basDt;
                  stockPrice15thInfo.vs = matchingStockPrice15thInfo.vs;
                  stockPrice15thInfo.mkp = matchingStockPrice15thInfo.mkp;
                  stockPrice15thInfo.hipr = matchingStockPrice15thInfo.hipr;
                  stockPrice15thInfo.lopr = matchingStockPrice15thInfo.lopr;
                  stockPrice15thInfo.trqu = matchingStockPrice15thInfo.trqu;
                  stockPrice15thInfo.trPrc = matchingStockPrice15thInfo.trPrc;
                  stockPrice15thInfo.lstgStCnt =
                    matchingStockPrice15thInfo.lstgStCnt;
                  stockPrice15thInfo.mrktTotAmt =
                    matchingStockPrice15thInfo.mrktTotAmt;

                  await manager.save(SpoStockPrice15thInfo, stockPrice15thInfo);
                }
              }
            }
          });

          this.logger.log(`Success SpoStockPrice15thInfo Update ${basDt}`);
          await this.updateStockPriceYearInfo();
        } else {
          this.logger.log(
            'Undefined Response from stockPrice15thInfoResData API',
            this.stockPrice15thInfoResData,
          );
          await this.updateStockPriceYearInfo();
        }
      } catch (error) {
        this.logger.error(
          'Error fetching data from getStockPriceThrMonInfo API:',
          error,
        );
      }
    }
  }

  // 1년 전 주식 가격 정보 배치
  async updateStockPriceYearInfo() {
    if (this.shouldRunBatch) {
      const basDt = StringUtil.getYearDate();
      console.log(basDt);
      try {
        const stockPriceYearInfoRes: any = await axios.get(
          `${
            OpenApi.GetStockPriceInfoService
          }?serviceKey=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_KEY',
          )}&basDt=${basDt}&resultType=${this.configService.get<string>(
            'RESULT_TYPE',
          )}&pageNo=${this.configService.get<string>(
            'PAGE_NO',
          )}&numOfRows=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_ROW',
          )}`,
        );
        this.stockPriceYearInfoResData =
          stockPriceYearInfoRes.data?.response?.body?.items?.item;
        if (
          StringUtil.isNotEmpty(this.stockPriceYearInfoResData) &&
          _.isArray(this.stockPriceYearInfoResData)
        ) {
          await this.dataSource.transaction(async (manager) => {
            const stockInfos = await manager.find(SpoStockInfo);
            for (const stockInfo of stockInfos) {
              const matchingStockPriceYearInfos = _.filter(
                this.stockPriceYearInfoResData,
                (stockPriceYearInfo) =>
                  'A' + stockPriceYearInfo.srtnCd === stockInfo.srtnCd,
              );
              if (matchingStockPriceYearInfos) {
                for (const matchingStockPriceYearInfo of matchingStockPriceYearInfos) {
                  const stockPriceYearInfo = new SpoStockPriceYearInfo();
                  stockPriceYearInfo.stockInfo = stockInfo;
                  stockPriceYearInfo.stockInfoSequence =
                    stockInfo.stockInfoSequence;
                  stockPriceYearInfo.srtnCd = matchingStockPriceYearInfo.srtnCd;
                  stockPriceYearInfo.itmsNm = matchingStockPriceYearInfo.itmsNm;
                  stockPriceYearInfo.clpr = matchingStockPriceYearInfo.clpr;
                  stockPriceYearInfo.fltRt = matchingStockPriceYearInfo.fltRt;
                  stockPriceYearInfo.basDt = matchingStockPriceYearInfo.basDt;
                  stockPriceYearInfo.vs = matchingStockPriceYearInfo.vs;
                  stockPriceYearInfo.mkp = matchingStockPriceYearInfo.mkp;
                  stockPriceYearInfo.hipr = matchingStockPriceYearInfo.hipr;
                  stockPriceYearInfo.lopr = matchingStockPriceYearInfo.lopr;
                  stockPriceYearInfo.trqu = matchingStockPriceYearInfo.trqu;
                  stockPriceYearInfo.trPrc = matchingStockPriceYearInfo.trPrc;
                  stockPriceYearInfo.lstgStCnt =
                    matchingStockPriceYearInfo.lstgStCnt;
                  stockPriceYearInfo.mrktTotAmt =
                    matchingStockPriceYearInfo.mrktTotAmt;

                  await manager.upsert(
                    SpoStockPriceYearInfo,
                    stockPriceYearInfo,
                    ['stockPriceSequence'],
                  );
                }
              }
            }
          });

          this.logger.log(`Success SpoStockPriceYearInfo Update ${basDt}`);
          await this.getMarketIndexInfo();
        } else {
          this.logger.log(
            'Undefined Response from stockPriceYearInfoResData API',
            this.stockPriceYearInfoResData,
          );
          await this.getMarketIndexInfo();
        }
      } catch (error) {
        this.logger.error(
          'Error fetching data from updateStockPriceYearInfo API:',
          error,
        );
      }
    }
  }

  // 지수 정보 배치
  async getMarketIndexInfo() {
    if (this.shouldRunBatch) {
      const basDt = StringUtil.getYesterdayDate();
      try {
        const stockMarketIndexInfoRes = await axios.get(
          `${
            OpenApi.GetStockMarketIndexService
          }?serviceKey=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_KEY',
          )}&basDt=${basDt}&resultType=${this.configService.get<string>(
            'RESULT_TYPE',
          )}&pageNo=${this.configService.get<string>(
            'PAGE_NO',
          )}&numOfRows=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_ROW',
          )}`,
        );
        this.stockMarketIndexInfoResData =
          stockMarketIndexInfoRes.data?.response?.body?.items?.item;

        const derivationMarketIndexInfoRes = await axios.get(
          `${
            OpenApi.GetDerivationMarketIndexService
          }?serviceKey=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_KEY',
          )}&basDt=${basDt}&resultType=${this.configService.get<string>(
            'RESULT_TYPE',
          )}&pageNo=${this.configService.get<string>(
            'PAGE_NO',
          )}&numOfRows=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_ROW',
          )}`,
        );

        this.derivationMarketIndexInfoResData =
          derivationMarketIndexInfoRes.data?.response?.body?.items?.item;

        const combinedMarketIndexInfos: Array<IMarketIndexInfoRes> =
          this.stockMarketIndexInfoResData.concat(
            this.derivationMarketIndexInfoResData,
          );

        if (
          StringUtil.isNotEmpty(combinedMarketIndexInfos) &&
          _.isArray(combinedMarketIndexInfos)
        ) {
          await this.dataSource.transaction(async (manager) => {
            for (const combinedMarketIndexInfo of combinedMarketIndexInfos) {
              const IdxNameArray: string[] = [
                '코스피',
                '코스닥',
                '코스닥 150',
                '코스피 200',
                '코스피 100',
                'KRX 300',
                '국채선물지수',
                'KRX 금현물지수',
              ];

              if (IdxNameArray.includes(combinedMarketIndexInfo.idxNm)) {
                const marketIndexInfo = new SpoMarketIndex();

                marketIndexInfo.vs = combinedMarketIndexInfo.vs;
                marketIndexInfo.clpr = combinedMarketIndexInfo.clpr;
                marketIndexInfo.fltRt = combinedMarketIndexInfo.fltRt;
                marketIndexInfo.idxNm = combinedMarketIndexInfo.idxNm;

                await manager.upsert(SpoMarketIndex, marketIndexInfo, [
                  'idxNm',
                ]);
              }
            }
          });
          this.logger.log(`Success SpoMarketIndex Update ${basDt}`);
          await this.updateEnterpriseCategory();
        } else {
          this.logger.log(
            'Undefined Response from getStockPriceInfo API',
            combinedMarketIndexInfos,
          );
          await this.updateEnterpriseCategory();
        }
      } catch (error) {
        this.logger.error(
          `Error fetching data from getMarketIndexInfo API: ${error}`,
        );
      }
    }
  }

  // 기업 평가 항목 배치
  async updateEnterpriseCategory() {
    if (this.shouldRunBatch) {
      await this.dataSource.transaction(async (manager) => {
        const stockInfos = await manager.find(SpoStockInfo);

        if (StringUtil.isNotEmpty(stockInfos)) {
          for (const stockInfo of stockInfos) {
            if (stockInfo.tradeSuspendYn === 'N') {
              const enterpriseCategoryInfo = new SpoEnterpriseCategory();
              const finaInfo = await manager.findOne(SpoSummFinaInfo, {
                where: { stockInfoSequence: stockInfo.stockInfoSequence },
              });
              const stockPriceInfo = await manager.findOne(SpoStockPriceInfo, {
                where: { stockInfoSequence: stockInfo.stockInfoSequence },
              });
              const stock15thPriceInfos = await manager.find(
                SpoStockPrice15thInfo,
                {
                  where: { stockInfoSequence: stockInfo.stockInfoSequence },
                },
              );
              const profitIncoInfos = await manager.find(SpoIncoInfo, {
                where: {
                  stockInfoSequence: stockInfo.stockInfoSequence,
                  acitId: In([
                    'ifrs-full_Revenue',
                    'ifrs-full_ProfitLossBeforeTax',
                    'dart_OperatingIncomeLoss',
                  ]),
                },
              });

              const requiredAcitIds = ['ifrs-full_ProfitLossBeforeTax'];
              const sortedStock15thPriceInfos = [...stock15thPriceInfos].sort(
                (a, b) => parseInt(a.basDt, 10) - parseInt(b.basDt, 10),
              );
              const yesterdayStockPriceInfo =
                sortedStock15thPriceInfos[sortedStock15thPriceInfos.length - 2]; // 전전일 주식 데이터
              const eps = finaInfo.enpCrtmNpf / stockPriceInfo.lstgStCnt; // eps
              const valueNetWorth =
                (finaInfo.enpTastAmt - finaInfo.enpTdbtAmt) /
                stockPriceInfo.lstgStCnt; // 순자산 가치

              enterpriseCategoryInfo.stockInfoSequence =
                stockInfo.stockInfoSequence;
              enterpriseCategoryInfo.itmsNm = stockInfo.itmsNm;
              enterpriseCategoryInfo.per = parseFloat(
                (stockPriceInfo.clpr / eps).toFixed(2),
              ); // 종가 / eps

              enterpriseCategoryInfo.pbr = parseFloat(
                (stockPriceInfo.clpr / valueNetWorth).toFixed(2),
              ); // 종가 / 순자산 가치
              for (const profitIncoInfo of profitIncoInfos) {
                if (profitIncoInfo.acitId === 'ifrs-full_ProfitLossBeforeTax') {
                  enterpriseCategoryInfo.incomeBeforeTaxExpenseDiff =
                    parseFloat(
                      (
                        ((profitIncoInfo.crtmAcitAmt -
                          profitIncoInfo.pvtrAcitAmt) /
                          profitIncoInfo.pvtrAcitAmt) *
                        100
                      ).toFixed(2),
                    );
                  // (현재기간순이익 - 이전기간순이익 / 이전기간 순이익) * 100
                } else if (
                  profitIncoInfo.acitId === 'ifrs-full_Revenue' ||
                  profitIncoInfo.acitId === 'dart_OperatingIncomeLoss'
                ) {
                  if (
                    StringUtil.isEmpty(enterpriseCategoryInfo.salesGrowthRate)
                  ) {
                    enterpriseCategoryInfo.salesGrowthRate = parseFloat(
                      (
                        ((profitIncoInfo.crtmAcitAmt -
                          profitIncoInfo.pvtrAcitAmt) /
                          profitIncoInfo.pvtrAcitAmt) *
                        100
                      ).toFixed(2),
                    );
                    // (현재기간순이익 - 이전기간순이익 / 이전기간 순이익) * 100
                  }
                }
              }
              if (
                !profitIncoInfos.some((info) =>
                  requiredAcitIds.includes(info.acitId),
                ) ||
                profitIncoInfos[0].pvtrAcitAmt === 0 ||
                profitIncoInfos[1].pvtrAcitAmt === 0 ||
                StringUtil.isEmpty(yesterdayStockPriceInfo) ||
                finaInfo.enpCrtmNpf === 0 ||
                finaInfo.enpTcptAmt === 0
              ) {
                await manager.update(
                  SpoStockInfo,
                  { srtnCd: stockInfo.srtnCd },
                  { badData: 'Y' },
                );
              } else {
                enterpriseCategoryInfo.financialStatementDebtRatio = parseFloat(
                  ((finaInfo.enpTdbtAmt / finaInfo.enpTcptAmt) * 100).toFixed(
                    2,
                  ),
                ); // (부채 / 자본) * 100

                enterpriseCategoryInfo.roe = parseFloat(
                  ((finaInfo.enpCrtmNpf / finaInfo.enpTcptAmt) * 100).toFixed(
                    2,
                  ),
                ); // (당기순이익 / 기업총자본금액) * 100

                enterpriseCategoryInfo.roa = parseFloat(
                  ((finaInfo.enpCrtmNpf / finaInfo.enpTastAmt) * 100).toFixed(
                    2,
                  ),
                ); // (당기순이익 / 기업총자산금액) * 100

                enterpriseCategoryInfo.moveAverage =
                  BatchCalculator.calculateMovingAverage(stock15thPriceInfos); // 이동평균선 계산
                enterpriseCategoryInfo.volume = parseFloat(
                  (
                    ((stockPriceInfo.trqu - yesterdayStockPriceInfo.trqu) /
                      yesterdayStockPriceInfo.trqu) *
                    100
                  ).toFixed(2),
                ); // {(현재거래량- 이전거래량)/ 이전거래량} * 100

                enterpriseCategoryInfo.changeMarketGap = parseFloat(
                  (
                    ((stockPriceInfo.mrktTotAmt -
                      yesterdayStockPriceInfo.mrktTotAmt) /
                      yesterdayStockPriceInfo.mrktTotAmt) *
                    100
                  ).toFixed(2),
                ); // {(현재시총 - 이전시총)/이전시총} * 100

                enterpriseCategoryInfo.volumeRatio = parseFloat(
                  (
                    (stockPriceInfo.trPrc / stockPriceInfo.mrktTotAmt) *
                    100
                  ).toFixed(2),
                ); // (거래대금 / 시총) * 100

                if (stockInfo.badData === 'Y') {
                  await manager.update(
                    SpoStockInfo,
                    { srtnCd: stockInfo.srtnCd },
                    { badData: 'N' },
                  );
                }
                await manager.upsert(
                  SpoEnterpriseCategory,
                  enterpriseCategoryInfo,
                  ['itmsNm'],
                );
              }
            }
          }
        }
      });
      this.logger.log(`Success updateEnterpriseCategory Update`);
      await this.updateEnterpriseScore();
    }
  }

  // 기업 평가 점수 배치
  async updateEnterpriseScore() {
    if (this.shouldRunBatch) {
      await this.dataSource.transaction(async (manager) => {
        const stockInfos = await manager.find(SpoStockInfo);
        if (StringUtil.isNotEmpty(stockInfos)) {
          for (const stockInfo of stockInfos) {
            if (stockInfo.badData === 'N' && stockInfo.tradeSuspendYn === 'N') {
              const enterpriseScoreInfo = new SpoEnterpriseScore();
              const enterpriseCategoryInfo = await manager.findOne(
                SpoEnterpriseCategory,
                {
                  where: { stockInfoSequence: stockInfo.stockInfoSequence },
                },
              );
              enterpriseScoreInfo.stockInfoSequence =
                stockInfo.stockInfoSequence;
              enterpriseScoreInfo.enterpriseCategorySequence =
                enterpriseCategoryInfo.enterpriseCategorySequence;
              enterpriseScoreInfo.itmsNm = stockInfo.itmsNm;
              enterpriseScoreInfo.financialStatementDebtRatioScore =
                BatchCalculator.getFinancialStatementDebtRatioScore(
                  enterpriseCategoryInfo.financialStatementDebtRatio,
                );
              enterpriseScoreInfo.roaScore = BatchCalculator.getRoaScore(
                enterpriseCategoryInfo.roa,
              );
              enterpriseScoreInfo.roeScore = BatchCalculator.getRoeScore(
                enterpriseCategoryInfo.roe,
              );
              enterpriseScoreInfo.pbrScore = BatchCalculator.getPbrScore(
                enterpriseCategoryInfo.pbr,
              );
              enterpriseScoreInfo.perScore = BatchCalculator.getPerScore(
                enterpriseCategoryInfo.per,
              );
              enterpriseScoreInfo.salesGrowthRateScore =
                BatchCalculator.getSalesGrowthRateScore(
                  enterpriseCategoryInfo.salesGrowthRate,
                );
              enterpriseScoreInfo.incomeBeforeTaxExpenseDiffScore =
                BatchCalculator.getIncomeBeforeTaxExpenseDiff(
                  enterpriseCategoryInfo.incomeBeforeTaxExpenseDiff,
                );
              enterpriseScoreInfo.moveAverageScore =
                BatchCalculator.getMoveAverageScore(
                  enterpriseCategoryInfo.moveAverage,
                );
              enterpriseScoreInfo.volumeScore = BatchCalculator.getVolumeScore(
                enterpriseCategoryInfo.volume,
              );
              enterpriseScoreInfo.changeMarketGapScore =
                BatchCalculator.getChangeMarketGapScore(
                  enterpriseCategoryInfo.changeMarketGap,
                );
              enterpriseScoreInfo.volumeRatioScore =
                BatchCalculator.getVolumeRatioScore(
                  enterpriseCategoryInfo.volumeRatio,
                );
              enterpriseScoreInfo.totalScore =
                enterpriseScoreInfo.pbrScore +
                enterpriseScoreInfo.perScore +
                enterpriseScoreInfo.salesGrowthRateScore +
                enterpriseScoreInfo.incomeBeforeTaxExpenseDiffScore +
                enterpriseScoreInfo.financialStatementDebtRatioScore +
                enterpriseScoreInfo.roeScore +
                enterpriseScoreInfo.roaScore +
                enterpriseScoreInfo.moveAverageScore +
                enterpriseScoreInfo.volumeScore +
                enterpriseScoreInfo.changeMarketGapScore +
                enterpriseScoreInfo.volumeRatioScore;
              enterpriseScoreInfo.rating = BatchCalculator.getRating(
                enterpriseScoreInfo.totalScore,
              );

              await manager.upsert(SpoEnterpriseScore, enterpriseScoreInfo, [
                'enterpriseScoreSequence',
              ]);
            }
          }
        }
      });
      this.logger.log(`Success updateEnterpriseScore Update`);
      await this.updateStockRisk();
    }
  }

  // 주식 위험도 배치
  async updateStockRisk() {
    if (this.shouldRunBatch) {
      await this.dataSource.transaction(async (manager) => {
        const stockPriceInfos = await manager.find(SpoStockPrice15thInfo);
        const stockInfos = await manager.find(SpoStockInfo);
        for (const stockInfo of stockInfos) {
          const stockRisk = new SpoStockRisk();
          const matchingPriceInfo = _.filter(
            stockPriceInfos,
            (stockPriceInfo) =>
              stockPriceInfo.stockInfoSequence ===
                stockInfo.stockInfoSequence &&
              stockInfo.tradeSuspendYn === 'N' &&
              stockInfo.badData === 'N',
          );
          if (StringUtil.isNotEmpty(matchingPriceInfo)) {
            // 표준편자 계산을 위한 종가 데이터 배열
            const clprArray = _.map(matchingPriceInfo, 'clpr');
            const standardDeviation =
              BatchCalculator.getStandardDeviation(clprArray);

            const highestClpr = _.maxBy(matchingPriceInfo, 'clpr').clpr;
            const lowestClpr = _.minBy(matchingPriceInfo, 'clpr').clpr;
            const percentageDifference = (
              ((highestClpr - lowestClpr) / lowestClpr) *
              100
            ).toFixed(2);
            const risk = BatchCalculator.getRisk(
              standardDeviation,
              Number(percentageDifference),
            );
            stockRisk.stockInfoSequence = stockInfo.stockInfoSequence;
            stockRisk.standardDeviation = standardDeviation;
            stockRisk.highLowDiff = Number(percentageDifference);
            stockRisk.risk = risk;

            await manager.upsert(SpoStockRisk, stockRisk, [
              'stockRiskSequence',
            ]);
          }
        }
      });
      this.logger.log(`Success updateStockRisk Update`);
      await this.updateVirtualStockProfit();
    }
  }

  // 기업 기본정보 초기화 배치
  async deleteEnterpriseInfo() {
    await this.dataSource.transaction(async (manager) => {
      await manager.clear(SpoEnterpriseInfo);
    });
  }

  // 가상투자 주식 수익률 배치
  async updateVirtualStockProfit() {
    await this.dataSource.transaction(async (manager) => {
      const userInvestmentStockList = await manager.find(
        SpoUserInvestmentStock,
      );

      for (const userInvestmentStock of userInvestmentStockList) {
        const stockPriceInfo = await manager.findOne(SpoStockPriceInfo, {
          where: { stockInfoSequence: userInvestmentStock.stockInfoSequence },
        });

        // 현재 가격을 가져와서 사용하여 수익률을 계산
        const currentPrice = stockPriceInfo.clpr;
        const itemFltRt = parseFloat(
          (
            ((currentPrice * userInvestmentStock.quantity -
              userInvestmentStock.itemBuyAmount) /
              userInvestmentStock.itemBuyAmount) *
            100
          ).toFixed(2),
        );
        const itemProfit =
          currentPrice * userInvestmentStock.quantity -
          userInvestmentStock.itemBuyAmount;
        const averageAmount =
          userInvestmentStock.itemBuyAmount / userInvestmentStock.quantity;
        const itemValueAmount = userInvestmentStock.itemBuyAmount + itemProfit;

        await manager.update(
          SpoUserInvestmentStock,
          {
            userInvestmentStockSequence:
              userInvestmentStock.userInvestmentStockSequence,
          },
          {
            itemFltRt: itemFltRt,
            itemProfit: itemProfit,
            averageAmount: averageAmount,
            itemValueAmount: itemValueAmount,
          },
        );
      }
    });
    this.logger.log(`Success updateVirtualStockProfit Update`);
  }

  // 가상투자 유저 수익률
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateVirtualUserProfit() {
    if (this.shouldRunBatch) {
      await this.dataSource.transaction(async (manager) => {
        const userInvestmentList = await manager.find(SpoUserInvestment);

        for (const userInvestment of userInvestmentList) {
          const userInvestmentStockList = await manager.find(
            SpoUserInvestmentStock,
            {
              where: { userSequence: userInvestment.userSequence },
            },
          );
          if (StringUtil.isNotEmpty(userInvestmentStockList)) {
            const totalItemBuyAmount = userInvestmentStockList.reduce(
              (total, stock) => {
                return total + stock.itemValueAmount;
              },
              0,
            );

            const profitLossSales =
              totalItemBuyAmount - userInvestment.buyAmount;
            const userFltRt = parseFloat(
              (
                ((totalItemBuyAmount - userInvestment.buyAmount) /
                  userInvestment.buyAmount) *
                100
              ).toFixed(2),
            );
            const valueAmount =
              profitLossSales +
              userInvestment.buyAmount +
              userInvestment.amount;

            await manager.update(
              SpoUserInvestment,
              {
                userInvestmentSequence: userInvestment.userInvestmentSequence,
              },
              {
                profitLossSales: profitLossSales,
                userFltRt: userFltRt,
                valueAmount: valueAmount,
              },
            );
          }
        }
      });
      this.logger.log(`Success updateVirtualUserProfit Update`);
      await this.updateVirtualStockProfit();
    }
  }
}
