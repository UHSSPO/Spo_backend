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
