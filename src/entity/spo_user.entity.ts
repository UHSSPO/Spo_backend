import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity({ name: 'SPO_USR' })
export class SpoUser {
  @PrimaryGeneratedColumn({ name: 'USR_SEQ' })
  @ApiProperty({ description: '유저일련번호', example: 11 })
  userSequence: number;

  @Column({ name: 'EMAIL' })
  @ApiProperty({ description: '유저일련번호', example: 'test@naver.com' })
  email: string;

  @Column({ name: 'PWD' })
  @Exclude()
  pwd: string;

  @Column({ name: 'SIGN_CHNL' })
  @ApiProperty({ description: '가입채널', example: 'kakao' })
  signUpChannel: string;

  @Column({ name: 'INVEST_PROP', nullable: true })
  @ApiProperty({ description: '투자성향', example: '01' })
  investPropensity?: string;

  @Column({ name: 'DELE_YN', nullable: true })
  @ApiProperty({ description: '탈퇴여부', example: 'N' })
  deleteYn?: string;

  @CreateDateColumn({ name: 'CRET_AT' })
  @ApiProperty({ description: '가입일', example: '20231201' })
  createdAt: Date;

  @Column({ name: 'DELE_AT', nullable: true })
  @ApiProperty({ description: '탈퇴일', example: '20231201' })
  deleteAt?: Date;

  @Column({ name: 'USR_ROLE' })
  @ApiProperty({ description: '유저권힌', example: 'ADM' })
  userRole: string;

  @Column({ name: 'NICK_NAM' })
  @ApiProperty({ description: '닉네임', example: '김성욱' })
  nickName: string;

  @Column({ name: 'DATE_BIRTH' })
  @ApiProperty({ description: '생년월일', example: '000525' })
  dateOfBirth: string;
}
