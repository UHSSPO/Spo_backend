import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class InterestRequestDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 3213,
    description: '주식상장정보 일련번호',
    required: true,
  })
  stockInfoSequence: number;
}
