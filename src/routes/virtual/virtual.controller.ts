import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VirtualService } from './virtual.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  BuyStockInvestmentRes,
  SelectUserInvestmentStart,
  SellStockInvestmentRes,
  StockRankingRes,
} from './dto/res.dto';
import { BuyStockInvestmentReq, SellStockInvestmentReq } from './dto/req.dto';
import { SpoUserInvestmentStock } from '../../entity/spo_user_investment_stock.entity';
import { SpoUserInvestment } from '../../entity/spo_user_investment.entity';

@ApiTags('virtual')
@Controller('virtual')
export class VirtualController {
  constructor(private virtualService: VirtualService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: SelectUserInvestmentStart,
  })
  @ApiOperation({
    summary: '가상투자 시작 여부',
  })
  async selectUserInvestmentStart(
    @Request() req,
  ): Promise<SelectUserInvestmentStart> {
    return await this.virtualService.selectUserInvestmentStart(req.user);
  }

  @Get('/list/:userSequence')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [SpoUserInvestmentStock],
  })
  @ApiOperation({
    summary: '가상 투자 유저 투자 리스트',
  })
  async selectUserInvestmentStockList(
    @Param('userSequence') userSequence: number,
  ): Promise<SpoUserInvestmentStock[]> {
    return await this.virtualService.selectUserInvestmentStockList(
      userSequence,
    );
  }

  @Get('/user/:userSequence')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: SpoUserInvestment,
  })
  @ApiOperation({
    summary: '가상 투자 유저 투자 정보',
  })
  async selectUserInvestmentInfo(
    @Param('userSequence') userSequence: number,
  ): Promise<SpoUserInvestment> {
    return await this.virtualService.selectUserInvestmentInfo(userSequence);
  }

  @Get('/ranking')
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [StockRankingRes],
  })
  @ApiOperation({
    summary: '가상투자 랭킹',
  })
  async selectStockRanking(): Promise<StockRankingRes[]> {
    return await this.virtualService.selectStockRanking();
  }

  @Post('/start')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: SelectUserInvestmentStart,
  })
  @ApiOperation({
    summary: '가상투자 시작',
  })
  async startVirtualInvestment(
    @Request() req,
  ): Promise<SelectUserInvestmentStart> {
    return this.virtualService.startVirtualInvestment(req.user);
  }

  @Post('/buy')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: BuyStockInvestmentRes,
  })
  @ApiOperation({
    summary: '가상투자 매수',
  })
  async buyStockInvestment(
    @Request() req,
    @Body() reqBody: BuyStockInvestmentReq,
  ): Promise<BuyStockInvestmentRes> {
    return this.virtualService.buyStockInvestment(reqBody, req.user);
  }

  @Post('/sell')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: SellStockInvestmentRes,
  })
  @ApiOperation({
    summary: '가상투자 매도',
  })
  async sellStockInvestment(
    @Request() req,
    @Body() reqBody: SellStockInvestmentReq,
  ): Promise<SellStockInvestmentRes> {
    return this.virtualService.sellStockInvestment(reqBody, req.user);
  }
}
