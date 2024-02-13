import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoStockInfo } from './spo_stock_info.entity';
import { SpoUser } from './spo_user.entity';

@Entity({ name: 'SPO_INTERST_STK' })
export class SpoInterestStock {
  @PrimaryGeneratedColumn({ name: 'INTERST_SEQ' })
  @ApiProperty({ description: '관심주식 일련번호', example: 11 })
  interestSequence: number;

  @Column({ name: 'STK_INFO_SEQ' })
  @ApiProperty({ description: '주식 상장 정보 일련번호', example: 1 })
  stockInfoSequence: number;

  @Column({ name: 'USR_SEQ' })
  @ApiProperty({ description: '유저일련번호', example: 11 })
  userSequence: number;

  @UpdateDateColumn({ name: 'UPDT_AT' })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;

  @ManyToOne(() => SpoStockInfo, (stockInfo) => stockInfo.stockInfoSequence)
  @JoinColumn({
    name: 'STK_INFO_SEQ',
    referencedColumnName: 'stockInfoSequence',
  })
  stockInfo: SpoStockInfo;

  @ManyToOne(() => SpoUser, (user) => user.userSequence)
  @JoinColumn({
    name: 'USR_SEQ',
    referencedColumnName: 'userSequence',
  })
  user: SpoUser;
}
