import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KakaoLoginDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'api key',
    required: true,
    example: '...',
  })
  apikey: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'call back url',
    required: true,
    example: 'http://...',
  })
  redirectUri: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'code',
    required: true,
    example: '...',
  })
  code: string;
}

export class CreateUserDto {
  @IsNotEmpty({ message: '이메일은 필수 입니다.' })
  @ApiProperty({
    description: 'email',
    required: true,
    example: 'sw536880@kakao.com',
  })
  email: string;

  @IsNotEmpty({ message: '비밀번호는 필수 입니다.' })
  @ApiProperty({
    description: 'pwd',
    required: true,
    example: 'dasdsdasdsafasdfafzxczx',
  })
  pw: string;

  @IsNotEmpty({ message: '생년월일은 필수 입니다.' })
  @MinLength(1)
  @MaxLength(6)
  @ApiProperty({
    description: '생년월일',
    required: true,
    example: '000525',
  })
  dataOfBirth: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '가입채널',
    required: true,
    example: 'kakao',
  })
  signInChannel: string;

  @IsNotEmpty({ message: '닉네임은 필수 입니다.' })
  @MinLength(1)
  @MaxLength(10, { message: '닉네임은 10자 이하 입니다.' })
  @ApiProperty({
    description: '닉네임',
    required: true,
    example: '김성욱',
  })
  nickName: string;
}
