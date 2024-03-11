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

  @Get('/stock-price/15th')
  stockPriceThrMonTask() {
    return this.batchService.getStockPrice15thInfo();
  }

  @Get('/stock-price/year')
  updateStockPriceYearInfo() {
    return this.batchService.updateStockPriceYearInfo();
  }

  @Get('/market-index')
  marketIndexBatchTask() {
    return this.batchService.getMarketIndexInfo();
  }

  @Get('/enterprise-category')
  enterpriseCategory() {
    return this.batchService.updateEnterpriseCategory();
  }

  @Get('/enterprise-score')
  enterpriseScore() {
    return this.batchService.updateEnterpriseScore();
  }

  @Get('/stock-risk')
  updateStockRisk() {
    return this.batchService.updateStockRisk();
  }

  @Get('/enterprise')
  deleteEnterpriseInfo() {
    return this.batchService.deleteEnterpriseInfo();
  }
}
