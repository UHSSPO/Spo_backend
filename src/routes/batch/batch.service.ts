import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isWeekend } from 'date-fns';
// import OpenApi from '../../common/openApi/openApi';
// import axios, { AxiosResponse } from 'axios';
// import IKrxListedInfoRes from '../../common/openApi/interface/openApiInterface';

@Injectable()
export class BatchService implements OnApplicationBootstrap {
  private shouldRunBatch = true;
  private getDate = '';

  onApplicationBootstrap() {
    this.shouldRunBatch = process.env.NODE_ENV !== 'dev';
  }

  @Cron(CronExpression.EVERY_DAY_AT_4PM) // 매일 오후 4시에 실행
  async stockBatchTask() {
    if (this.shouldRunBatch && !isWeekend(new Date())) {
      // const krxListedInfoRes: AxiosResponse<IKrxListedInfoRes[]> =
      //   await axios.get(OpenApi.GetKrxListedInfoService);
      // console.log(krxListedInfoRes);
      // 주말 배치작동 x
      console.log('stockBatch task is running at', new Date());
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
