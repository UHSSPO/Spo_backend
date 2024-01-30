import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoEnterpriseScore } from './spo_entpr_scor.entity';
import { SpoStockInfo } from './spo_stock_info.entity';

@Entity({ name: 'SPO_ENTPR_CATEGR' })
export class SpoEnterpriseCategory {
  @PrimaryGeneratedColumn({ name: 'ENTPR_CATEGO_SEQ' })
  @ApiProperty({ description: '기업 평가 항목 일련번호', example: 11 })
  enterpriseCategorySequence: number;

  @Column({ name: 'STK_INFO_SEQ' })
  @ApiProperty({ description: '주식 상장 정보 일련번호', example: 1 })
  stockInfoSequence: number;

  @Column({ name: 'PBR', type: 'double' })
  @ApiProperty({ description: 'PBR', example: 122 })
  pbr: number;

  @Column({ name: 'PER', type: 'double' })
  @ApiProperty({ description: 'PER', example: 99 })
  per: number;

  @Column({ name: 'SALES_GRO_RATE', type: 'double' })
  @ApiProperty({ description: '매출 성장률', example: 1232 })
  salesGrowthRate: number;

  @Column({ name: 'INCO_BEFO_TAX_EXPEN_DIFF', type: 'double' })
  @ApiProperty({
    description: '법인세 비용 차감 전 순이익 성장률',
    example: 32.1,
  })
  incomeBeforeTaxExpenseDiff: number;

  @Column({ name: 'FNCL_STAT_DEBR_RAT', type: 'double' })
  @ApiProperty({ description: '재무제표부 채비율', example: 15.2 })
  financialStatementDebtRatio: number;

  @Column({ name: 'ROE', type: 'double' })
  @ApiProperty({ description: 'ROE', example: 1.2 })
  roe: number;

  @Column({ name: 'ROA', type: 'double' })
  @ApiProperty({ description: 'ROA', example: 5.2 })
  roa: number;

  @Column({ name: 'THT_MON_AVG_STK_PRIC_FLUCT', type: 'double' })
  @ApiProperty({ description: '3개월 주가 등락률 평균', example: 12.1 })
  threeMonthAverageStockPrice: number;

  @Column({ name: 'VOLUME', type: 'double' })
  @ApiProperty({ description: '거래량 변화 비율', example: 22 })
  volume: number;

  @Column({ name: 'CHAN_MAKT_GAP', type: 'double' })
  @ApiProperty({ description: '시가총액 변화 비율', example: 11 })
  changeMarketGap: number;

  @Column({ name: 'VOL_RAT', type: 'double' })
  @ApiProperty({ description: '거래대금 거래량 비율', example: 11 })
  volumeRatio: number;

  @OneToOne(() => SpoEnterpriseScore, (score) => score.enterpriseCategory, {
    cascade: true,
  })
  @JoinColumn({
    name: 'ENTPR_SCOR_SEQ',
  })
  enterpriseScore: SpoEnterpriseScore;

  @OneToOne(() => SpoStockInfo, {
    cascade: true,
  })
  @JoinColumn({
    name: 'STK_INFO_SEQ',
    referencedColumnName: 'stockInfoSequence',
  })
  stockInfo: SpoStockInfo;
}
