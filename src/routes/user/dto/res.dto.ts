import { ApiProperty } from '@nestjs/swagger';

export class InvestPropensityRes {
  @ApiProperty({
    example: '05',
    description: '투자성향',
    required: true,
  })
  investPropensity: string;
}
