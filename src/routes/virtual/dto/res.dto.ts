import { ApiProperty } from '@nestjs/swagger';

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
