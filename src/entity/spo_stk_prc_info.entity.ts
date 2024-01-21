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

@Entity({ name: 'SPO_STK_PRC_INFO' })
export class SpoStkPrcInfo {
  @PrimaryGeneratedColumn({ name: 'STK_PRC_SEQ' })
  @ApiProperty({ description: '주식전일종가일련번호', example: 1 })
  stockPriceSequence: number;

  @Column({ name: 'STK_INFO_SEQ' })
  @ApiProperty({ description: '주식 상장 정보 일련번호', example: 1 })
  stockInfoSequence: number;

  @Column({ name: 'DPR' })
  @ApiProperty({ description: '종가', example: 50000 })
  dpr: number;

  @Column({ name: 'FLT_RT' })
  @ApiProperty({ description: '등락률', example: 3.25 })
  fltRt: number;

  @Column({ name: 'MKP' })
  @ApiProperty({ description: '시가', example: 40000 })
  mkp: number;

  @Column({ name: 'HIPR' })
  @ApiProperty({ description: '고가', example: 52000 })
  hipr: number;

  @Column({ name: 'LOPR' })
  @ApiProperty({ description: '저가', example: 39000 })
  lopr: number;

  @Column({ name: 'TRQU' })
  @ApiProperty({ description: '거래량', example: 123000 })
  trqu: number;

  @Column({ name: 'TR_PRC' })
  @ApiProperty({ description: '거래대금', example: 6344312213 })
  trPrc: number;

  @Column({ name: 'LSTG_ST_CNT' })
  @ApiProperty({ description: '상장주식수', example: 3434251 })
  lstgStCnt: number;

  @Column({ name: 'MRKT_TOT_AMT' })
  @ApiProperty({ description: '시가총액', example: 632341223 })
  mrktTotAmt: number;

  @UpdateDateColumn({ name: 'UPDT_AT' })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;

  @ManyToOne(() => SpoStockInfo, { eager: true }) // SpoStockInfo 엔터티와의 다대일(ManyToOne) 관계를 정의합니다.
  @JoinColumn({
    name: 'STK_INFO_SEQ',
    referencedColumnName: 'stockInfoSequence',
  })
  stockInfo: SpoStockInfo;
}
