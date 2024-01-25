import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoStockInfo } from './spo_stock_info.entity';

@Entity({ name: 'SPO_SUMM_FINA_INFO' })
@Index('idx_crno', ['crno'], { unique: true })
export class SpoSummFinaInfo {
  @PrimaryGeneratedColumn({ name: 'FNCL_SEQ' })
  @ApiProperty({ description: '재무제표 일련번호', example: 1 })
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
  curCd: string;

  @Column({ name: 'FNCL_DCD' })
  @ApiProperty({ description: '재무재표구분코드', example: '110' })
  fnclDcd: string;

  @Column({ name: 'FNCL_DCD_NM' })
  @ApiProperty({
    description: '재무재표구분코드명',
    example: '연결요약재무제표',
  })
  fnclDcdNm: string;

  @Column({ name: 'ENP_SALE_AMT', type: 'bigint' })
  @ApiProperty({ description: '기업매출금액', example: 10000000 })
  enpSaleAmt: number;

  @Column({ name: 'ENP_BZOP_PFT', type: 'bigint' })
  @ApiProperty({ description: '기업영업이익', example: 12000000 })
  enpBzopPft: number;

  @Column({ name: 'ICLS_PAL_CLC_AMT', type: 'bigint' })
  @ApiProperty({ description: '포괄손익계산금액', example: 13000000 })
  iclsPalClcAmt: number;

  @Column({ name: 'ENP_CRTM_NPF', type: 'bigint' })
  @ApiProperty({ description: '기업당기순이익', example: 14000000 })
  enpCrtmNpf: number;

  @Column({ name: 'ENP_TAST_AMT', type: 'bigint' })
  @ApiProperty({ description: '기업총자산금액', example: 250000000 })
  enpTastAmt: number;

  @Column({ name: 'ENP_TDBT_AMT', type: 'bigint' })
  @ApiProperty({ description: '기업총부채금액', example: 2000000 })
  enpTdbtAmt: number;

  @Column({ name: 'ENP_TCPT_AMT', type: 'bigint' })
  @ApiProperty({ description: '기업총자본금액', example: 220000000 })
  enpTcptAmt: number;

  @Column({ name: 'ENP_CPTL_AMT', type: 'bigint' })
  @ApiProperty({ description: '기업자본금액', example: 250000000 })
  enpCptlAmt: number;

  @Column({ name: 'FNCL_DEBT_RTO', type: 'double' })
  @ApiProperty({ description: '재무제표부채비율', example: 18.3213 })
  fnclDebtRto: number;

  @UpdateDateColumn({ name: 'UPDT_AT' })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;

  @ManyToOne(() => SpoStockInfo)
  @JoinColumn({
    name: 'STK_INFO_SEQ',
    referencedColumnName: 'stockInfoSequence',
  })
  stockInfo: SpoStockInfo;
}
