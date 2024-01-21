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

  private krxCrnoArray: string[] = [];
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

        const items = krxListedInfoRes.data?.response?.body?.items?.item;

        if (StringUtil.isNotEmpty(items) && Array.isArray(items)) {
          this.krxListedInfoResData = items.map((item: any) => ({
            resultCode: item.resultCode,
            resultMsg: item.resultMsg,
            numOfRows: item.numOfRows,
            pageNo: item.pageNo,
            totalCount: item.totalCount,
            basDt: item.basDt,
            srtnCd: item.srtnCd,
            isinCd: item.isinCd,
            mrktCtg: item.mrktCtg,
            itmsNm: item.itmsNm,
            crno: item.crno,
            corpNm: item.corpNm,
          }));
          this.logger.log(
            `stockBatch task is running ${basDt} krxListedInfoResData length ${this.krxListedInfoResData.length}`,
          );
          await this.getFinaStatInfo();
        } else {
          this.logger.log('Undefined krxListedInfoRes', krxListedInfoRes.data);
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
        const items = response.data?.response?.body?.items?.item;

        if (StringUtil.isNotEmpty(items) && Array.isArray(items)) {
          // 법인번호 배열 추출
          this.krxCrnoArray = this.krxListedInfoResData.map(
            (item: IKrxListedInfoRes) => item.crno,
          );

          // 재무정보와 상장정보 존재하는 법인 번호로 필터링
          this.finaStatInfoResData = _.filter(
            items,
            (item: IFinaStatInfoRes) =>
              this.krxCrnoArray.includes(item.crno) && item.fnclDcd === '120',
          );

          // Set 자료구조 사용해서 중복 제거
          const finaCrnoArray = Array.from(
            new Set(
              this.finaStatInfoResData.map(
                (item: IFinaStatInfoRes) => item.crno,
              ),
            ),
          );
          // 재무정보와 상장정보 존재하는 법인 번호로 필터링
          this.krxListedInfoResData = _.filter(
            this.krxListedInfoResData,
            (item: IFinaStatInfoRes) => finaCrnoArray.includes(item.crno),
          );

          // 상장정보 법인번호 재추출 (krxListedInfoResData 변경)
          this.krxCrnoArray = this.krxListedInfoResData.map(
            (item: IKrxListedInfoRes) => item.crno,
          );

          await this.dataSource.transaction(async (manager) => {
            for (const krxListedInfoResData of this.krxListedInfoResData) {
              const stockInfo = new SpoStockInfo();
              stockInfo.basDt = krxListedInfoResData.basDt;
              stockInfo.crno = krxListedInfoResData.crno;
              stockInfo.corpNm = krxListedInfoResData.corpNm;
              stockInfo.itmsNm = krxListedInfoResData.itmsNm;
              stockInfo.mrktCtg = krxListedInfoResData.mrktCtg;

              await manager.query(
                `
                  INSERT INTO SPO_STK_INFO (BAS_DT, CRNO, CORP_NM, ITMS_NM, MRKT_CTG)
                  VALUES (?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                    BAS_DT = VALUES(BAS_DT),
                    CRNO = VALUES(CRNO),
                    CORP_NM = VALUES(CORP_NM),
                    ITMS_NM = VALUES(ITMS_NM),
                    MRKT_CTG = VALUES(MRKT_CTG)
                `,
                [
                  stockInfo.basDt,
                  stockInfo.crno,
                  stockInfo.corpNm,
                  stockInfo.itmsNm,
                  stockInfo.mrktCtg,
                ],
              );
            }
          });

          this.logger.log(
            `getFinaStatInfo task is running krxListedInfoResData length ${this.krxListedInfoResData.length} finaStatInfoResData length ${this.finaStatInfoResData.length}`,
          );
          await this.getIncoStatInfo();
        } else {
          this.logger.log('Undefined Response from getFinaStatInfo API', items);
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
      // 공시일자가 3월말에서 4월말 사이라 수동 작업
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
        const items = response.data?.response?.body?.items?.item;

        if (StringUtil.isNotEmpty(items) && Array.isArray(items)) {
          // 재무정보와 상장정보 존재하는 법인 번호로 필터링
          this.incoStataInfoResData = _.filter(
            items,
            (item: IIncoStatInfoRes) => this.krxCrnoArray.includes(item.crno),
          );
          this.logger.log(
            `getIncoStatInfo task is running incoStataInfoResData length ${this.incoStataInfoResData.length}`,
          );
          await this.getStockPriceInfo();
        } else {
          this.logger.log('Undefined Response from getIncoStatInfo API', items);
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
