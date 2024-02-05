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
import { HomeService } from './home.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { InterestRequestDto } from './dto/req.dto';
import { LocalAuthGuard } from '../../auth/local-auth.guard';
import { JwtAllGuard } from '../../auth/jwt-all.guard';

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
    return await this.homeService.getShortInvestRecommend(req.user);
  }

  @Get('/long-investment-recommend')
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
    return await this.homeService.getLongInvestRecommend(req.user);
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
    return this.homeService.updateInterestStock(reqBody, req);
  }
}
