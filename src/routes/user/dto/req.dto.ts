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

export class DeleteUserReqBody {
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  @ApiProperty({
    example: '123456789',
    description: '비밀번호',
    required: true,
  })
  password: string;
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

export class ChangeNickNameReqBody {
  @IsNotEmpty({ message: '변경할 닉네임은 필수 입니다.' })
  @ApiProperty({
    example: '성욱',
    description: '변경 닉네임',
    required: true,
  })
  changeNickName: string;
}
