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
  IStockPriceInfoRes,
} from '../../common/openApi/interface/openApiInterface';
import _ from 'lodash';
import { DataSource } from 'typeorm';
import { SpoStockInfo } from '../../entity/spo_stock_info.entity';
import { SpoSummFinaInfo } from '../../entity/spo_summ_fina_info.entity';
import { SpoIncoInfo } from '../../entity/spo_inco_info.entity';

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

  private krxItemsNameArray: string[] = [];

  onApplicationBootstrap() {
    this.shouldRunBatch =
      process.env.NODE_ENV !== 'dev' && !isWeekend(new Date());
    // this.shouldRunBatch = true;
  }

  // 상장종목정보
  @Cron(CronExpression.EVERY_DAY_AT_4PM) // 매일 오후 4시에 실행
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
                finaInfo.enpSaleAmt = matchingFinaInfo.enpSaleAmt as number;
                finaInfo.enpBzopPft = matchingFinaInfo.enpBzopPft as number;
                finaInfo.iclsPalClcAmt =
                  matchingFinaInfo.iclsPalClcAmt as number;
                finaInfo.enpCrtmNpf = matchingFinaInfo.enpCrtmNpf as number;
                finaInfo.enpTastAmt = matchingFinaInfo.enpTastAmt as number;
                finaInfo.enpTdbtAmt = matchingFinaInfo.enpTdbtAmt as number;
                finaInfo.enpTcptAmt = matchingFinaInfo.enpTcptAmt as number;
                finaInfo.enpCptlAmt = matchingFinaInfo.enpCptlAmt as number;
                finaInfo.fnclDebtRto = matchingFinaInfo.fnclDebtRto as number;

                await manager.upsert(SpoSummFinaInfo, finaInfo, ['crno']);
              }
            }
          });
          this.logger.log(`Success SpoSummFinaInfo Update`);
          // await this.getIncoStatInfo();
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
        const items = stockPriceInfoRes.data?.response?.body?.items?.item;

        if (StringUtil.isNotEmpty(items) && _.isArray(items)) {
          this.krxItemsNameArray = this.krxListedInfoResData.map(
            (item: IKrxListedInfoRes) => item.itmsNm,
          );

          this.stockPriceInfoResData = _.filter(
            items,
            (item: IStockPriceInfoRes) =>
              this.krxItemsNameArray.includes(item.itmsNm),
          );

          this.logger.log(
            `getStockPriceInfo task is running stockPriceInfoResData length ${this.stockPriceInfoResData.length}`,
          );
          await this.getStockPriceThreeMonthInfo();
        } else {
          this.logger.log(
            'Undefined Response from getStockPriceInfo API',
            items,
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
        const items =
          stockPriceThreeMonthInfoRes.data?.response?.body?.items?.item;

        if (StringUtil.isNotEmpty(items) && _.isArray(items)) {
          this.stockPriceThreeMonthInfoResData = _.filter(
            items,
            (item: IStockPriceInfoRes) =>
              this.krxItemsNameArray.includes(item.itmsNm),
          );

          const threeMonthInfoResNameArray =
            this.stockPriceThreeMonthInfoResData.map(
              (item: IStockPriceInfoRes) => item.itmsNm,
            );

          this.stockPriceInfoResData = _.filter(
            this.stockPriceInfoResData,
            (item: any) => threeMonthInfoResNameArray.includes(item.itmsNm),
          );

          this.logger.log(
            `getStockPriceThreeMonthInfo task is running stockPriceThreeMonthInfoResData length ${this.stockPriceThreeMonthInfoResData.length}`,
          );
        } else {
          this.logger.log(
            'Undefined Response from stockPriceThreeMonthInfoResData API',
            items,
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
}
