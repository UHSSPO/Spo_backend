import { ApiProperty } from '@nestjs/swagger';

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
