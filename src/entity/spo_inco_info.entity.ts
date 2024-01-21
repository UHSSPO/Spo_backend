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

@Entity({ name: 'SPO_INCO_INFO' })
export class SpoIncoInfo {
  @PrimaryGeneratedColumn({ name: 'INCO_SEQ' })
  @ApiProperty({ description: '손익계산서 일련번호', example: 1 })
  finaInfoSequence: number;

  @Column({ name: 'STK_INFO_SEQ' })
  @ApiProperty({ description: '주식 상장 정보 일련번호', example: 1 })
  stockInfoSequence: number;

  @Column({ name: 'CRNO' })
  @ApiProperty({ description: '법인등록번호', example: '123753265' })
  crno: string;

  @Column({ name: 'BIZ_YEAR' })
  @ApiProperty({ description: '사업연도', example: '2023' })
  bizYear: string;

  @Column({ name: 'CUR_CD' })
  @ApiProperty({ description: '통화코드', example: 'KRW' })
  curCD: string;

  @Column({ name: 'FNCL_DCD' })
  @ApiProperty({ description: '재무재표구분코드', example: '110' })
  fnclDCD: string;

  @Column({ name: 'FNCL_DCD_NM' })
  @ApiProperty({
    description: '재무재표구분코드명',
    example: '연결재무제표',
  })
  fnclDcdNm: string;

  @Column({ name: 'ACIT_ID' })
  @ApiProperty({
    description: '계정과목ID',
    example: 'dart_OperatingIncomeLoss',
  })
  actiId: string;

  @Column({ name: 'ACIT_NM' })
  @ApiProperty({
    description: '계정과목명',
    example: '연결재무제표',
  })
  acitNm: string;

  @Column({ name: 'THQR_ACIT_AMT' })
  @ApiProperty({ description: '당분기계정과목금액', example: 10000000 })
  thqrAcitAmt: number;

  @Column({ name: 'CRTM_ACIT_AMT' })
  @ApiProperty({ description: '당기계정과목금액', example: 12000000 })
  crtmAcitAmt: number;

  @Column({ name: 'ISQT_ACIT_AMT' })
  @ApiProperty({ description: '전분기계정과목금액', example: 11000000 })
  isqtAcitAmt: number;

  @Column({ name: 'PVTR_ACIT_AMT' })
  @ApiProperty({ description: '전기계정과목금액', example: 12000000 })
  pvtrAcitAmt: number;

  @Column({ name: 'BPVTR_ACIT_AMT' })
  @ApiProperty({ description: '전전기계정과목금액', example: 12000000 })
  bpvtrAcitAmt: number;

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
