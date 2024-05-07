import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { SpoUserInvestment } from '../../../entity/spo_user_investment.entity';
import { SpoStockPriceInfo } from '../../../entity/spo_stock_price_info.entity';
import { SpoUserInvestmentStock } from '../../../entity/spo_user_investment_stock.entity';

export class SelectUserInvestmentStart {
  @ApiProperty({
    example: 'Y',
    description: '가상 투자 시작 여부',
    required: true,
  })
  startInvestmentYn: string;
}

export class BuyStockInvestmentRes {
  @ApiProperty({
    example: 'Y',
    description: '가상 투자 매수 여부',
    required: true,
  })
  buyStockYn: string;
}

export class SellStockInvestmentRes {
  @ApiProperty({
    example: 'Y',
    description: '가상 투자 매도 여부',
    required: true,
  })
  sellStockYn: string;
}

export class StockRankingRes extends OmitType(SpoUserInvestment, [
  'userSequence',
  'userFltRt',
  'valueAmount',
  'profitLossSales',
]) {
  @ApiProperty({
    example: '성욱',
    description: '유저 닉네임',
    required: true,
  })
  nickName: string;
}

export class SelectVirtualStockDetailRes extends PickType(SpoStockPriceInfo, [
  'stockInfoSequence',
  'srtnCd',
  'itmsNm',
  'basDt',
  'clpr',
]) {}

export class SelectInvestmentStockRes extends OmitType(SpoUserInvestmentStock, [
  'user',
  'stockInfo',
]) {
  @ApiProperty({
    example: '삼성전자',
    description: '종목명',
    required: true,
  })
  itmsNm: string;
}
