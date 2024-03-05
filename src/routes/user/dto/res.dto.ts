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

export class SelectMyInfoRes extends OmitType(SpoUser, [
  'pwd',
  'signUpChannel',
  'deleteYn',
  'deleteAt',
]) {}
