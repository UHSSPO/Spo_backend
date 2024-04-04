import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuyStockInvestmentReq {
  @IsNotEmpty()
  @ApiProperty({
    example: 3213,
    description: '주식상장정보 일련번호',
    required: true,
  })
  stockInfoSequence: number;

  @IsNotEmpty({ message: '매수량을 입력해 주세요.' })
  @ApiProperty({
    example: 3,
    description: '매수량',
    required: true,
  })
  quantity: number;
}

export class SellStockInvestmentReq {
  @IsNotEmpty()
  @ApiProperty({
    example: 3213,
    description: '주식상장정보 일련번호',
    required: true,
  })
  stockInfoSequence: number;

  @IsNotEmpty({ message: '매도량을 입력해 주세요.' })
  @ApiProperty({
    example: 3,
    description: '매도량',
    required: true,
  })
  quantity: number;
}
