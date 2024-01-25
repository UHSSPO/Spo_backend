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
import { DataSource } from 'typeorm';
import { SpoStockInfo } from '../../entity/spo_stock_info.entity';
import { SpoSummFinaInfo } from '../../entity/spo_summ_fina_info.entity';
import { SpoIncoInfo } from '../../entity/spo_inco_info.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';
import { SpoStockPriceThrMonInfo } from '../../entity/spo_stock_price_thr_mon_info.entity';
import { SpoMarketIndex } from '../../entity/spo_market_index.entity';

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
  private stockPriceThreeMonthInfoResData: Array<IStockPriceInfoRes> = [];
  private stockMarketIndexInfoResData: Array<IMarketIndexInfoRes> = [];
  private derivationMarketIndexInfoResData: Array<IMarketIndexInfoRes> = [];

  onApplicationBootstrap() {
    this.shouldRunBatch =
      process.env.NODE_ENV !== 'dev' && !isWeekend(new Date());
    // this.shouldRunBatch = true;
  }

  // 상장종목정보
  @Cron('0 0 16 5 * *') // 매달 5일 오후 4시에 실행
  async stockBatchTask() {
    if (this.shouldRunBatch) {
      const basDt = StringUtil.getYesterdayDate();
      try {
        // 상장종목 정보 호출
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

        if (
          StringUtil.isNotEmpty(this.krxListedInfoResData) &&
          _.isArray(this.krxListedInfoResData)
        ) {
          await this.dataSource.transaction(async (manager) => {
            const finaInfos = await manager.find(SpoSummFinaInfo);
            for (const finaInfo of finaInfos) {
              const matchingKrxListedInfo = this.krxListedInfoResData.find(
                (item) => item.crno === finaInfo.crno,
              );
              if (matchingKrxListedInfo) {
                const stockInfo = new SpoStockInfo();
                stockInfo.basDt = matchingKrxListedInfo.basDt;
                stockInfo.crno = matchingKrxListedInfo.crno;
                stockInfo.srtnCd = matchingKrxListedInfo.srtnCd;
                stockInfo.corpNm = matchingKrxListedInfo.corpNm;
                stockInfo.itmsNm = matchingKrxListedInfo.itmsNm;
                stockInfo.mrktCtg = matchingKrxListedInfo.mrktCtg;

                await manager.upsert(SpoStockInfo, stockInfo, ['crno']);
              }
            }
            this.logger.log('Success SpoStockInfo Update');
          });
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

  // 기업 재무제표
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

  // 손익계산서
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

            for (const stockInfo of stockInfos) {
              const matchingIncoInfos = this.incoStataInfoResData.filter(
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
          await this.getStockPriceInfo();
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

  // 주식 시세 정보
  @Cron(CronExpression.EVERY_DAY_AT_4PM) // 매일 4시에 실행
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
                stockPriceInfo.vs = matchingStockPriceInfo.vs;
                stockPriceInfo.mkp = matchingStockPriceInfo.mkp;
                stockPriceInfo.hipr = matchingStockPriceInfo.hipr;
                stockPriceInfo.lopr = matchingStockPriceInfo.lopr;
                stockPriceInfo.trqu = matchingStockPriceInfo.trqu;
                stockPriceInfo.trPrc = matchingStockPriceInfo.trPrc;
                stockPriceInfo.lstgStCnt = matchingStockPriceInfo.lstgStCnt;
                stockPriceInfo.mrktTotAmt = matchingStockPriceInfo.mrktTotAmt;

                await manager.upsert(SpoStockPriceInfo, stockPriceInfo, [
                  'srtnCd',
                ]);
              }
            }
          });
          this.logger.log(`Success SpoStockPriceInfo Update ${basDt}`);
          await this.getStockPriceThreeMonthInfo();
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

  // 3개월 전 주식 시세 정보
  async getStockPriceThreeMonthInfo() {
    if (this.shouldRunBatch) {
      const basDt = StringUtil.getThreeMonthDate();
      try {
        // 3개월 전 주식 시세 정보 호출
        const stockPriceThreeMonthInfoRes: any = await axios.get(
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
        this.stockPriceThreeMonthInfoResData =
          stockPriceThreeMonthInfoRes.data?.response?.body?.items?.item;

        if (
          StringUtil.isNotEmpty(this.stockPriceThreeMonthInfoResData) &&
          _.isArray(this.stockPriceThreeMonthInfoResData)
        ) {
          await this.dataSource.transaction(async (manager) => {
            const stockInfos = await manager.find(SpoStockInfo);
            for (const stockInfo of stockInfos) {
              const matchingStockPriceThreeMonthInfo =
                this.stockPriceThreeMonthInfoResData.find(
                  (stockPriceThreeMonthInfo) =>
                    'A' + stockPriceThreeMonthInfo.srtnCd === stockInfo.srtnCd,
                );
              if (matchingStockPriceThreeMonthInfo) {
                const stockPriceThreeMonthInfo = new SpoStockPriceThrMonInfo();
                stockPriceThreeMonthInfo.stockInfo = stockInfo;
                stockPriceThreeMonthInfo.stockInfoSequence =
                  stockInfo.stockInfoSequence;
                stockPriceThreeMonthInfo.srtnCd =
                  matchingStockPriceThreeMonthInfo.srtnCd;
                stockPriceThreeMonthInfo.itmsNm =
                  matchingStockPriceThreeMonthInfo.itmsNm;
                stockPriceThreeMonthInfo.clpr =
                  matchingStockPriceThreeMonthInfo.clpr;
                stockPriceThreeMonthInfo.fltRt =
                  matchingStockPriceThreeMonthInfo.fltRt;
                stockPriceThreeMonthInfo.vs =
                  matchingStockPriceThreeMonthInfo.vs;
                stockPriceThreeMonthInfo.mkp =
                  matchingStockPriceThreeMonthInfo.mkp;
                stockPriceThreeMonthInfo.hipr =
                  matchingStockPriceThreeMonthInfo.hipr;
                stockPriceThreeMonthInfo.lopr =
                  matchingStockPriceThreeMonthInfo.lopr;
                stockPriceThreeMonthInfo.trqu =
                  matchingStockPriceThreeMonthInfo.trqu;
                stockPriceThreeMonthInfo.trPrc =
                  matchingStockPriceThreeMonthInfo.trPrc;
                stockPriceThreeMonthInfo.lstgStCnt =
                  matchingStockPriceThreeMonthInfo.lstgStCnt;
                stockPriceThreeMonthInfo.mrktTotAmt =
                  matchingStockPriceThreeMonthInfo.mrktTotAmt;

                await manager.upsert(
                  SpoStockPriceThrMonInfo,
                  stockPriceThreeMonthInfo,
                  ['srtnCd'],
                );
              }
            }
          });

          this.logger.log(`Success SpoStockPriceThrMonInfo Update ${basDt}`);
          await this.getMarketIndexInfo();
        } else {
          this.logger.log(
            'Undefined Response from stockPriceThreeMonthInfoResData API',
            this.stockPriceThreeMonthInfoResData,
          );
        }
      } catch (error) {
        this.logger.error(
          'Error fetching data from getStockPriceThrMonInfo API:',
          error,
        );
      }
    }
  }

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
            this.logger.log(`Success SpoMarketIndex Update ${basDt}`);
          });
        } else {
          this.logger.log(
            'Undefined Response from getStockPriceInfo API',
            combinedMarketIndexInfos,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error fetching data from getMarketIndexInfo API: ${error}`,
        );
      }
    }
  }
}
