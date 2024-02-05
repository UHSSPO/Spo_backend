import { ApiProperty } from '@nestjs/swagger';

export class MarketIndexResDto {
  @ApiProperty({
    example: 1,
    description: '지수 일련번호',
    required: true,
  })
  marketIndexSequence: number;

  @ApiProperty({
    example: 'KRX 300',
    description: '지수명',
    required: true,
  })
  idxNm: string;

  @ApiProperty({
    example: 324.12,
    description: '종가',
    required: true,
  })
  clpr: number;

  @ApiProperty({
    example: 4.12,
    description: '대비',
    required: true,
  })
  vs: number;

  @ApiProperty({
    example: 2.12,
    description: '등락률',
    required: true,
  })
  fltRt: number;
}

export class RecommendStockInfo {
  @ApiProperty({
    example: 1,
    description: '주식상장정보 일련번호',
    required: true,
  })
  stockInfoSequence: number;

  @ApiProperty({
    example: '현대차',
    description: '주식명',
    required: true,
  })
  itmsNm: string;

  @ApiProperty({
    example: 19032,
    description: '종가',
    required: true,
  })
  clpr: number;

  @ApiProperty({
    example: 1.2,
    description: '등락률',
    required: true,
  })
  fltRt: number;

  @ApiProperty({
    example: 123113,
    description: '거래량',
    required: true,
  })
  trqu: number;

  @ApiProperty({
    example: 5423423123,
    description: '시가총액',
    required: true,
  })
  mrktTotAmt: number;
}

export class UpdateInterestStock {
  @ApiProperty({
    example: 'Y',
    description: '관심주식 여부',
    required: true,
  })
  interestStockYn: string;
}
