import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoStockInfo } from './spo_stock_info.entity';

@Entity({ name: 'SPO_STK_RISK' })
export class SpoStockRisk {
  @PrimaryGeneratedColumn({ name: 'STK_RISK_SEQ' })
  @ApiProperty({ description: '주식위험도 일련번호', example: 1 })
  stockRiskSequence: number;

  @Column({ name: 'STK_INFO_SEQ' })
  @ApiProperty({ description: '주식 상장 정보 일련번호', example: 1 })
  stockInfoSequence: number;

  @Column({ name: 'STAND_DEVIATION' })
  @ApiProperty({ description: '표준편차', example: 1 })
  standardDeviation: number;

  @Column({ name: 'HIGH_LOW_DIFF' })
  @ApiProperty({ description: '고가저가 차이', example: 1 })
  highLowDiff: number;

  @Column({ name: 'RISK' })
  @ApiProperty({ description: '위험도', example: '01' })
  risk: string;

  @UpdateDateColumn({ name: 'UPDT_AT' })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;

  @OneToOne(() => SpoStockInfo, {
    cascade: true,
  })
  @JoinColumn({
    name: 'STK_INFO_SEQ',
    referencedColumnName: 'stockInfoSequence',
  })
  stockInfo: SpoStockInfo;
}
