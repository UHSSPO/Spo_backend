import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'SPO_USR' })
export class Spo_User {
  @PrimaryGeneratedColumn({ name: 'USR_SEQ' })
  @ApiProperty({ description: '유저일련번호', example: '1' })
  userSequence: string;

  @Column({ name: 'EMAIL' })
  @ApiProperty({ description: '유저일련번호', example: 'test@naver.com' })
  email: string;

  @Column({ name: 'PWD' })
  @ApiProperty({
    description: '유저일련번호',
    example: 'akfjakljfklj13kljkrasuflassk',
  })
  pwd: string;

  @Column({ name: 'SIGN_CHNL' })
  @ApiProperty({ description: '가입채널', example: 'kakao' })
  signInChannel: string;
}
