import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoEnterpriseCategory } from './spo_entpr_categr.entity';
import { SpoStockInfo } from './spo_stock_info.entity';

@Entity({ name: 'SPO_ENTPR_SCOR' })
export class SpoEnterpriseScore {
  @PrimaryGeneratedColumn({ name: 'ENTPR_SCOR_SEQ' })
  @ApiProperty({ description: '기업 평가 점수 일련번호', example: 11 })
  enterpriseScoreSequence: number;

  @Column({ name: 'ENTPR_CATEGO_SEQ' })
  @ApiProperty({ description: '기업 평가 항목 일련번호', example: 11 })
  enterpriseCategorySequence: number;

  @Column({ name: 'STK_INFO_SEQ' })
  @ApiProperty({ description: '주식 상장 정보 일련번호', example: 1 })
  stockInfoSequence: number;

  @Column({ name: 'ENTPR_ITMS_NM' })
  @ApiProperty({ description: '종목명', example: '삼성전자' })
  itmsNm: string;

  @Column({ name: 'PBR_SCOR' })
  @ApiProperty({ description: 'PBR 점수', example: 15 })
  pbrScore: number;

  @Column({ name: 'PER_SCOR' })
  @ApiProperty({ description: 'PER 점수', example: 20 })
  perScore: number;

  @Column({ name: 'SALES_GRO_RATE_SCOR' })
  @ApiProperty({ description: '매출 성장률 점수', example: 25 })
  salesGrowthRateScore: number;

  @Column({ name: 'INCO_BEFO_TAX_EXPEN_DIFF_SCOR' })
  @ApiProperty({
    description: '법인세 비용 차감 전 순이익 성장률 점수',
    example: 15,
  })
  incomeBeforeTaxExpenseDiffScore: number;

  @Column({ name: 'FNCL_STAT_DEBR_RAT_SCOR' })
  @ApiProperty({ description: '재무제표 부채비율 점수', example: 15 })
  financialStatementDebtRatioScore: number;

  @Column({ name: 'ROE_SCOR' })
  @ApiProperty({ description: 'ROE 점수', example: 10 })
  roeScore: number;

  @Column({ name: 'ROA_SCOR' })
  @ApiProperty({ description: 'ROA 점수', example: 20 })
  roaScore: number;

  @Column({ name: 'MOV_AVG_SCOR' })
  @ApiProperty({ description: '3개월 주가 등락률 평균 점수', example: 25 })
  moveAverageScore: number;

  @Column({ name: 'VOLUME_SCOR' })
  @ApiProperty({ description: '거래량 변화 비율 점수', example: 25 })
  volumeScore: number;

  @Column({ name: 'CHAN_MAKT_GAP_SCOR' })
  @ApiProperty({ description: '시가총액 변화 비율 점수', example: 10 })
  changeMarketGapScore: number;

  @Column({ name: 'VOL_RAT_SCOR' })
  @ApiProperty({ description: '거래대금 거래량 비율 점수', example: 10 })
  volumeRatioScore: number;

  @UpdateDateColumn({ name: 'UPDT_AT' })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;

  @OneToOne(() => SpoEnterpriseCategory, (category) => category.enterpriseScore)
  @JoinColumn({
    name: 'ENTPR_CATEGO_SEQ',
    referencedColumnName: 'enterpriseCategorySequence',
  })
  enterpriseCategory: SpoEnterpriseCategory;

  @OneToOne(() => SpoStockInfo, {
    cascade: true,
  })
  @JoinColumn({
    name: 'STK_INFO_SEQ',
    referencedColumnName: 'stockInfoSequence',
  })
  stockInfo: SpoStockInfo;
}
