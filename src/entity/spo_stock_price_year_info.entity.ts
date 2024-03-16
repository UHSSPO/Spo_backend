import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoStockInfo } from './spo_stock_info.entity';

@Entity({ name: 'SPO_STK_PRIC_YEAR_INFO' })
export class SpoStockPriceYearInfo {
  @PrimaryGeneratedColumn({ name: 'STK_PRC_SEQ' })
  @ApiProperty({ description: '1년 주식 가격정보', example: 1 })
  stockPriceSequence: number;

  @Column({ name: 'STK_INFO_SEQ' })
  @ApiProperty({ description: '주식 상장 정보 일련번호', example: 1 })
  stockInfoSequence: number;

  @Column({ name: 'SRTN_CD' })
  @ApiProperty({ description: '단축코드', example: '00123' })
  srtnCd: string;

  @Column({ name: 'ITMS_NM' })
  @ApiProperty({ description: '종목명', example: '삼성전자' })
  itmsNm: string;

  @Column({ name: 'BAS_DT' })
  @ApiProperty({ description: '기준일자', example: '20240102' })
  basDt: string;

  @Column({ name: 'CLPR', type: 'bigint' })
  @ApiProperty({ description: '종가', example: 50000 })
  clpr: number;

  @Column({ name: 'FLT_RT', type: 'double' })
  @ApiProperty({ description: '등락률', example: 3.25 })
  fltRt: number;

  @Column({ name: 'VS', type: 'bigint' })
  @ApiProperty({ description: '대비', example: 500 })
  vs: number;

  @Column({ name: 'MKP', type: 'bigint' })
  @ApiProperty({ description: '시가', example: 40000 })
  mkp: number;

  @Column({ name: 'HIPR', type: 'bigint' })
  @ApiProperty({ description: '고가', example: 52000 })
  hipr: number;

  @Column({ name: 'LOPR', type: 'bigint' })
  @ApiProperty({ description: '저가', example: 39000 })
  lopr: number;

  @Column({ name: 'TRQU', type: 'bigint' })
  @ApiProperty({ description: '거래량', example: 123000 })
  trqu: number;

  @Column({ name: 'TR_PRC', type: 'bigint' })
  @ApiProperty({ description: '거래대금', example: 6344312213 })
  trPrc: number;

  @Column({ name: 'LSTG_ST_CNT', type: 'bigint' })
  @ApiProperty({ description: '상장주식수', example: 3434251 })
  lstgStCnt: number;

  @Column({ name: 'MRKT_TOT_AMT', type: 'bigint' })
  @ApiProperty({ description: '시가총액', example: 632341223 })
  mrktTotAmt: number;

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
