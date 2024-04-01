import { ApiProperty, OmitType } from '@nestjs/swagger';
import { SpoUser } from '../../../entity/spo_user.entity';

export class InvestPropensityRes {
  @ApiProperty({
    example: '05',
    description: '투자성향',
    required: true,
  })
  investPropensity: string;
}

export class ChangePasswordRes {
  @ApiProperty({
    example: 'Y',
    description: '비밀번호 변경 여부',
    required: true,
  })
  changePasswordYn: string;
}

export class ChangeNickNameRes {
  @ApiProperty({
    example: 'Y',
    description: '닉네임 변경 여부',
    required: true,
  })
  changeNickNameYn: string;
}

export class UserInfoRes extends OmitType(SpoUser, [
  'pwd',
  'signUpChannel',
  'deleteYn',
  'deleteAt',
  'interestStock',
  'board',
  'boardComment',
  'userInvestment',
  'userInvestmentHistory',
  'userInvestmentStock',
]) {}

export class PriceInfoRes {
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

export class SelectMyInfoRes extends UserInfoRes {
  @ApiProperty({
    example: [
      {
        stockInfoSequence: 1,
        itmsNm: '현대차',
        clpr: 19032,
        fltRt: 1.2,
        trqu: 123113,
        mrktTotAmt: 5423423123,
      },
    ],
    description: '내 관심종목',
    required: true,
  })
  interestStock: Array<PriceInfoRes>;
}
