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

export class ChangePasswordReqBody {
  @IsNotEmpty({ message: '현재 비밀번호는 필수입니다.' })
  @ApiProperty({
    example: 45,
    description: '현재 비밀번호',
    required: true,
  })
  beforePassword: string;

  @IsNotEmpty({ message: '변경 비밀번호는 필수입니다.' })
  @ApiProperty({
    example: 45,
    description: '변경 비밀번호',
    required: true,
  })
  afterPassword: string;
}
