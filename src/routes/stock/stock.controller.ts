import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  MarketIndexResDto,
  RecommendStockInfo,
  ThemeStockInfo,
  UpdateInterestStock,
} from './dto/res.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { InterestRequestDto } from './dto/req.dto';
import { JwtAllGuard } from '../../auth/jwt-all.guard';
import { SpoStockInfo } from '../../entity/spo_stock_info.entity';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

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
    return await this.stockService.getHomeMarketIndex();
  }

  @Get('/theme')
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ThemeStockInfo,
  })
  @ApiOperation({
    summary: '테마별 탐색 api',
  })
  async getThemeStockInfo(): Promise<ThemeStockInfo> {
    return await this.stockService.getThemeStockInfo();
  }

  @Get('/popular')
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: RecommendStockInfo,
  })
  @ApiOperation({
    summary: '인기종목 api',
  })
  async getPopularStockInfo(): Promise<RecommendStockInfo[]> {
    return await this.stockService.getPopularStockInfo();
  }

  @Get(':stockInfoSequence')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: SpoStockInfo,
  })
  @ApiOperation({
    summary: '주식 상세 api',
  })
  async getStockInfo(
    @Param('stockInfoSequence') stockInfoSequence: number,
  ): Promise<SpoStockInfo> {
    return this.stockService.getStockInfo(stockInfoSequence);
  }

  @Get('/recommend/short-investment')
  @UseGuards(JwtAllGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: RecommendStockInfo,
  })
  @ApiOperation({
    summary: '단기투자 추천 종목 api',
  })
  async getShortInvestRecommend(@Request() req): Promise<RecommendStockInfo[]> {
    return await this.stockService.getShortInvestRecommend(req.user);
  }

  @Get('/recommend/long-investment')
  @UseGuards(JwtAllGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: RecommendStockInfo,
  })
  @ApiOperation({
    summary: '장기투자 추천 종목 api',
  })
  async getLongInvestRecommend(@Request() req): Promise<RecommendStockInfo[]> {
    return await this.stockService.getLongInvestRecommend(req.user);
  }

  @Post('/interest')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: UpdateInterestStock,
  })
  @ApiOperation({
    summary: '관심주식 등록',
  })
  async updateInterestStock(
    @Body() reqBody: InterestRequestDto,
    @Request() req,
  ): Promise<UpdateInterestStock> {
    return this.stockService.updateInterestStock(reqBody, req);
  }
}
