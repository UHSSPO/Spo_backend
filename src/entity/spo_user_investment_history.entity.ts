import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoUser } from './spo_user.entity';

@Entity({ name: 'SPO_USR_INVEST_HIST' })
export class SpoUserInvestmentHistory {
  @PrimaryGeneratedColumn({ name: 'USR_INVEST_HIST_SEQ' })
  @ApiProperty({ description: '유저 투자내역 일련번호', example: 1 })
  userInvestmentHistorySequence: number;

  @Column({ name: 'USR_SEQ' })
  @ApiProperty({ description: '유저 일련 번호', example: 1 })
  userSequence: number;

  @Column({ name: 'ITMS_NM' })
  @ApiProperty({ description: '종목명', example: '삼성전자' })
  itmsNm: string;

  @Column({ name: 'BUY_SELL' })
  @ApiProperty({ description: '매수 매도 여부', example: 'BUY' })
  buySell: string;

  @Column({ name: 'QUAN', type: 'bigint' })
  @ApiProperty({ description: '보유수량', example: 12 })
  quantity: number;

  @CreateDateColumn({ name: 'CRET_AT' })
  @ApiProperty({ description: '생성 일자', example: '20231218' })
  creatAt: Date;

  @ManyToOne(() => SpoUser, (user) => user.userSequence)
  @JoinColumn({
    name: 'USR_SEQ',
    referencedColumnName: 'userSequence',
  })
  user: SpoUser;
}
