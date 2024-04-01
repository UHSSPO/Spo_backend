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
import { SpoStockInfo } from './spo_stock_info.entity';

@Entity({ name: 'SPO_USR_INVEST_STK' })
export class SpoUserInvestmentStock {
  @PrimaryGeneratedColumn({ name: 'USR_INVEST_STK_SEQ' })
  @ApiProperty({ description: '유저 투자 종목 정보 일련번호', example: 1 })
  userInvestmentStockSequence: number;

  @Column({ name: 'USR_SEQ' })
  @ApiProperty({ description: '유저 일련 번호', example: 1 })
  userSequence: number;

  @Column({ name: 'STK_INFO_SEQ' })
  @ApiProperty({ description: '주식 상장 정보 일련번호', example: 1 })
  stockInfoSequence: number;

  @Column({ name: 'QUAN', type: 'bigint' })
  @ApiProperty({ description: '보유수량', example: 12 })
  quantity: number;

  @Column({ name: 'ITMS_VALU_AMT', type: 'bigint' })
  @ApiProperty({ description: '평가금액', example: 1200000 })
  itemValueAmount: number;

  @Column({ name: 'ITMS_BUY_AMT', type: 'bigint' })
  @ApiProperty({ description: '매수금액', example: 1200000 })
  itemBuyAmount: number;

  @Column({ name: 'ITMS_PRFIT', type: 'bigint' })
  @ApiProperty({ description: '손익', example: 20000 })
  itemProfit: number;

  @Column({ name: 'ITMS_FLR_RT' })
  @ApiProperty({ description: '수익률', example: 20 })
  itemFltRt: number;

  @Column({ name: 'AVG_AMT', type: 'bigint' })
  @ApiProperty({ description: '평균단가', example: 1200000 })
  averageAmount: number;

  @CreateDateColumn({ name: 'CRET_AT' })
  @ApiProperty({ description: '생 일자', example: '20231218' })
  creatAt: Date;

  @ManyToOne(() => SpoUser, (user) => user.userSequence)
  @JoinColumn({
    name: 'USR_SEQ',
    referencedColumnName: 'userSequence',
  })
  user: SpoUser;

  @ManyToOne(() => SpoStockInfo, (stockInfo) => stockInfo.stockInfoSequence)
  @JoinColumn({
    name: 'STK_INFO_SEQ',
    referencedColumnName: 'stockInfoSequence',
  })
  stockInfo: SpoStockInfo;
}
