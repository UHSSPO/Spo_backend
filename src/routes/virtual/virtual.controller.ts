import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VirtualService } from './virtual.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  BuyStockInvestmentRes,
  SelectUserInvestmentStart,
  SellStockInvestmentRes,
} from './dto/res.dto';
import { BuyStockInvestmentReq, SellStockInvestmentReq } from './dto/req.dto';

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

  @Post('/start')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
  })
  @ApiOperation({
    summary: '가상투자 시작',
  })
  async startVirtualInvestment(@Request() req): Promise<void> {
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
    summary: '가상투자 매수',
  })
  async sellStockInvestment(
    @Request() req,
    @Body() reqBody: SellStockInvestmentReq,
  ): Promise<SellStockInvestmentRes> {
    return this.virtualService.sellStockInvestment(reqBody, req.user);
  }
}
