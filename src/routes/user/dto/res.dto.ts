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

export class SelectMyInfoRes extends OmitType(SpoUser, [
  'pwd',
  'signUpChannel',
  'deleteYn',
  'deleteAt',
]) {}
