import { Controller, Get } from '@nestjs/common';
import { BatchService } from './batch.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Batch')
@Controller('batch')
export class BatchController {
  constructor(private batchService: BatchService) {}
  @Get('/stock')
  stockBatchTask() {
    return this.batchService.stockBatchTask();
  }

  @Get('/fina')
  finaBatchTask() {
    return this.batchService.getFinaStatInfo();
  }

  @Get('/inco')
  incoBatchTask() {
    return this.batchService.getIncoStatInfo();
  }

  @Get('/stock-price')
  stockPriceBatchTask() {
    return this.batchService.getStockPriceInfo();
  }

  @Get('/stock-price/three-month')
  stockPriceThrMonTask() {
    return this.batchService.getStockPriceThreeMonthInfo();
  }

  @Get('/market-index')
  marketIndexBatchTask() {
    return this.batchService.getMarketIndexInfo();
  }
}
