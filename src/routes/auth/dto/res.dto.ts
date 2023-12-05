import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Spo_User } from '../../../entity/spo_user.entity';

export class KakaoLoginResDto {
  @ApiProperty({
    example: '김성욱',
    description: 'string',
    required: true,
  })
  nickName: string;

  @ApiProperty({
    example: 'sw536880@kako.com',
    description: 'string',
    required: true,
  })
  email: string;
}

export class UserDto extends OmitType(Spo_User, [
  'pwd',
  'deleteYn',
  'createdAt',
  'deleteAt',
]) {}

export class LoginResDto {
  @ApiProperty({
    example: '...',
    description: 'jwt 토큰',
    required: true,
  })
  accessToken: string;

  @ApiProperty({
    type: UserDto,
    description: '사용자 정보',
    required: true,
  })
  user: UserDto;
}
