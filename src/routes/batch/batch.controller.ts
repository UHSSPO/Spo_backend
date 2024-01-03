import { Controller, Get } from '@nestjs/common';
import { BatchService } from './batch.service';

@Controller('batch')
export class BatchController {
  constructor(private batchService: BatchService) {}
  @Get('/stock')
  stockBatchTask() {
    return this.batchService.stockBatchTask();
  }
}
