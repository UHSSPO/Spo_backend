import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoUser } from './spo_user.entity';

@Entity({ name: 'SPO_USR_INVEST' })
export class SpoUserInvestment {
  @PrimaryGeneratedColumn({ name: 'USR_INVEST_SEQ' })
  @ApiProperty({ description: '유저 투자 정보 일련번호', example: 1 })
  userInvestmentSequence: number;

  @Column({ name: 'USR_SEQ' })
  @ApiProperty({ description: '유저 일련 번호', example: 1 })
  userSequence: number;

  @Column({ name: 'AMT', type: 'bigint' })
  @ApiProperty({ description: '현재금액', example: 1000000 })
  amount: number;

  @Column({ name: 'BUY_AMT', type: 'bigint', default: 0 })
  @ApiProperty({ description: '매수금액', example: 1000000 })
  buyAmount: number;

  @Column({ name: 'PRFIT_LOS_SALES', type: 'bigint', default: 0 })
  @ApiProperty({ description: '매매손익', example: 20000 })
  profitLossSales: number;

  @Column({ name: 'VALU_AMT', type: 'bigint', default: 0 })
  @ApiProperty({ description: '평가금액', example: 1002000 })
  valueAmount: number;

  @ManyToOne(() => SpoUser, (user) => user.userSequence)
  @JoinColumn({
    name: 'USR_SEQ',
    referencedColumnName: 'userSequence',
  })
  user: SpoUser;
}
