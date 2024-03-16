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
  HomeStockInfo,
  ThemeStockInfo,
  UpdateInterestStock,
  SearchStockInfo,
  StockInfoResDto,
} from './dto/res.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { InterestRequestDto } from './dto/req.dto';
import { JwtAllGuard } from '../../auth/jwt-all.guard';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [SearchStockInfo],
  })
  @ApiOperation({
    summary: '전체 상장 종목 api',
  })
  async getAllStock(): Promise<SearchStockInfo[]> {
    return this.stockService.getAllStock();
  }
  @Get('/market-index')
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [MarketIndexResDto],
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
  @UseGuards(JwtAllGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [HomeStockInfo],
  })
  @ApiOperation({
    summary: '인기종목 api',
  })
  async getPopularStockInfo(@Request() req): Promise<HomeStockInfo[]> {
    return await this.stockService.getPopularStockInfo(req.user);
  }

  @Get(':stockInfoSequence')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: StockInfoResDto,
  })
  @ApiOperation({
    summary: '주식 상세 api',
  })
  async getStockInfo(
    @Param('stockInfoSequence') stockInfoSequence: number,
  ): Promise<StockInfoResDto> {
    return this.stockService.getStockInfo(stockInfoSequence);
  }

  @Get('/recommend/short-investment')
  @UseGuards(JwtAllGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [HomeStockInfo],
  })
  @ApiOperation({
    summary: '단기투자 추천 종목 api',
  })
  async getShortInvestRecommend(@Request() req): Promise<HomeStockInfo[]> {
    return await this.stockService.getShortInvestRecommend(req.user);
  }

  @Get('/recommend/long-investment')
  @UseGuards(JwtAllGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [HomeStockInfo],
  })
  @ApiOperation({
    summary: '장기투자 추천 종목 api',
  })
  async getLongInvestRecommend(@Request() req): Promise<HomeStockInfo[]> {
    return await this.stockService.getLongInvestRecommend(req.user);
  }

  @Get('/my/interest')
  @UseGuards(JwtAllGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [HomeStockInfo],
  })
  @ApiOperation({
    summary: '내 관심 주식 api',
  })
  async getMyInterestStock(@Request() req): Promise<HomeStockInfo[]> {
    return await this.stockService.getMyInterestStock(req.user);
  }

  @Get('/recommend/long-investment-all')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [HomeStockInfo],
  })
  @ApiOperation({
    summary: '장기투자 추천 종목 더보기 api',
  })
  async getLongInvestRecommendAll(@Request() req): Promise<HomeStockInfo[]> {
    return await this.stockService.getLongInvestRecommendAll(req.user);
  }

  @Get('/recommend/short-investment-all')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [HomeStockInfo],
  })
  @ApiOperation({
    summary: '단기투자 추천 종목 더보기 api',
  })
  async getShortInvestRecommendAll(@Request() req): Promise<HomeStockInfo[]> {
    return await this.stockService.getShortInvestRecommendAll(req.user);
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
    return this.stockService.updateInterestStock(reqBody, req.user);
  }
}
