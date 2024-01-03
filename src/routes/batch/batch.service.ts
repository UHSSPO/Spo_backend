import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isWeekend } from 'date-fns';
import OpenApi from '../../common/openApi/openApi';
import axios from 'axios';
import IKrxListedInfoRes from '../../common/openApi/interface/openApiInterface';
import StringUtil from '../../common/util/StringUtil';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BatchService implements OnApplicationBootstrap {
  constructor(private configService: ConfigService) {}
  private shouldRunBatch = true;
  private logger = new Logger(BatchService.name);

  private krxListedInfoResData: Array<IKrxListedInfoRes> = [];

  onApplicationBootstrap() {
    // this.shouldRunBatch = process.env.NODE_ENV !== 'dev';
    this.shouldRunBatch = true;
  }

  @Cron(CronExpression.EVERY_DAY_AT_4PM) // 매일 오후 4시에 실행
  async stockBatchTask() {
    if (this.shouldRunBatch && !isWeekend(new Date())) {
      // 상장종목정보
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
          )}&numOfRow=${this.configService.get<string>(
            'GET_KRX_LIST_INFO_ROW',
          )}`,
        );

        const items = krxListedInfoRes.data?.response?.body?.items?.item;

        if (items && Array.isArray(items)) {
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
            'stockBatch task is running',
            this.krxListedInfoResData,
          );
          await this.getFinaStatInfo();
        } else {
          this.logger.log('Undefined krxListedInfoRes', krxListedInfoRes.data);
          await this.getFinaStatInfo();
        }
      } catch (error) {
        this.logger.error('Error fetching data from API:', error);
      }
    }
  }

  async getFinaStatInfo() {
    if (this.shouldRunBatch && !isWeekend(new Date())) {
      const basDt = StringUtil.getCurrentYear();
      this.logger.log(basDt);
    }
  }

  //TODO: 기업 재무제표 api 호출 예정
  @Cron('0 0 0 2 1 *') // 매년 1월 2일 24시에 실행
  handleBatchTask() {
    if (this.shouldRunBatch) {
      console.log('Batch task is running at', new Date());
    }
  }
}
