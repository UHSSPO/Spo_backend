import { Controller, Get } from '@nestjs/common';
import { MarketIndexResDto, RecommendStockInfo } from './dto/res.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';

@ApiTags('Home')
@Controller('home')
export class HomeController {
  constructor(private homeService: HomeService) {}
  @Get('/market-index')
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: MarketIndexResDto,
  })
  @ApiOperation({
    summary: '지수정보 api',
  })
  async getHomeMarketIndex(): Promise<MarketIndexResDto[]> {
    return await this.homeService.getHomeMarketIndex();
  }

  @Get('/short-investment-recommend')
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: RecommendStockInfo,
  })
  @ApiOperation({
    summary: '단기투자 추천 종목 api',
  })
  async getShortInvestRecommend(): Promise<RecommendStockInfo[]> {
    return await this.homeService.getShortInvestRecommend();
  }

  @Get('/long-investment-recommend')
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: RecommendStockInfo,
  })
  @ApiOperation({
    summary: '장기투자 추천 종목 api',
  })
  async getLongInvestRecommend(): Promise<RecommendStockInfo[]> {
    return await this.homeService.getLongInvestRecommend();
  }
  @Get('/popular-stock')
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: RecommendStockInfo,
  })
  @ApiOperation({
    summary: '인기종목 api',
  })
  async getPopularStockInfo(): Promise<RecommendStockInfo[]> {
    return await this.homeService.getPopularStockInfo();
  }
}
