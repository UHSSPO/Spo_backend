import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class InvestPropensityReqBody {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 45,
    description: '투자성향',
    required: true,
  })
  totalScore: number;
}
