import { Controller, Get } from '@nestjs/common';
import { BatchService } from './batch.service';

@Controller('batch')
export class BatchController {
  constructor(private batchService: BatchService) {}
  @Get('/')
  stockBatchTask() {
    return this.batchService.stockBatchTask();
  }
}
