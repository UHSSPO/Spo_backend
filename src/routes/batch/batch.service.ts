import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isWeekend } from 'date-fns';

@Injectable()
export class BatchService implements OnApplicationBootstrap {
  private shouldRunBatch: boolean = true;

  onApplicationBootstrap() {
    this.shouldRunBatch = process.env.NODE_ENV !== 'dev';
  }

  @Cron(CronExpression.EVERY_DAY_AT_4PM) // 매일 오후 4시에 실행
  stockBatchTask() {
    if (this.shouldRunBatch && !isWeekend(new Date())) {
      // 주말 배치작동 x
      console.log('Batch task is running at', new Date());
    }
  }

  @Cron('0 0 24 2 1 *') // 매년 1월 2일 24시에 실행
  handleBatchTask() {
    if (this.shouldRunBatch) {
      console.log('Batch task is running at', new Date());
    }
  }
}
