import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { SpoInterestStock } from './spo_interest_stock.entity';
import { SpoBoard } from './spo_board.entity';
import { SpoBoardComment } from './spo_board_comment.entity';
import { SpoUserInvestment } from './spo_user_investment.entity';
import { SpoUserInvestmentStock } from './spo_user_investment_stock.entity';
import { SpoUserInvestmentHistory } from './spo_user_investment_history.entity';

@Entity({ name: 'SPO_USR' })
export class SpoUser {
  @PrimaryGeneratedColumn({ name: 'USR_SEQ' })
  @ApiProperty({ description: '유저일련번호', example: 11 })
  userSequence: number;

  @Column({ name: 'EMAIL' })
  @ApiProperty({ description: '이메일', example: 'test@naver.com' })
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

  @OneToMany(() => SpoInterestStock, (interestStock) => interestStock.user)
  @ApiProperty({ description: '관심주식', type: [SpoInterestStock] })
  interestStock: SpoInterestStock[];

  @OneToMany(() => SpoBoard, (board) => board.user)
  @ApiProperty({ description: '게시판', type: [SpoBoard] })
  board: SpoBoard[];

  @OneToMany(() => SpoBoardComment, (boardComment) => boardComment.user)
  @ApiProperty({ description: '게시판', type: [SpoBoardComment] })
  boardComment: SpoBoardComment[];

  @OneToMany(
    () => SpoUserInvestmentStock,
    (userInvestmentStock) => userInvestmentStock.user,
  )
  @ApiProperty({
    description: '유저 투자 종목 정보',
    type: [SpoUserInvestmentStock],
  })
  userInvestmentStock: SpoUserInvestmentStock[];

  @OneToMany(
    () => SpoUserInvestmentHistory,
    (userInvestmentHistory) => userInvestmentHistory.user,
  )
  @ApiProperty({
    description: '유저 투자 내역',
    type: [SpoUserInvestmentHistory],
  })
  userInvestmentHistory: SpoUserInvestmentHistory[];

  @OneToOne(() => SpoUserInvestment, (userInvestment) => userInvestment.user)
  @ApiProperty({ description: '유저 투자 정보', type: SpoUserInvestment })
  userInvestment: SpoUserInvestment;
}
