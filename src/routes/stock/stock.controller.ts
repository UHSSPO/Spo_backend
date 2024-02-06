import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  MarketIndexResDto,
  RecommendStockInfo,
  UpdateInterestStock,
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

  @UseGuards(JwtAuthGuard)
  @Post('/interest')
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
