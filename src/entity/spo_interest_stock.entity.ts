import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoEnterpriseCategory } from './spo_entpr_categr.entity';
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

  @ManyToMany(() => SpoStockInfo, (stockInfo) => stockInfo.stockInfoSequence)
  @JoinColumn({
    name: 'STK_INFO_SEQ',
    referencedColumnName: 'stockInfoSequence',
  })
  enterpriseCategory: SpoEnterpriseCategory;

  @ManyToMany(() => SpoUser, (user) => user.userSequence)
  @JoinColumn({
    name: 'USR_SEQ',
    referencedColumnName: 'userSequence',
  })
  user: SpoUser;
}
