import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoSummFinaInfo } from './spo_summ_fina_info.entity';
import { SpoIncoInfo } from './spo_inco_info.entity';
import { SpoStockPriceInfo } from './spo_stock_price_info.entity';
import { SpoStockPrice15thInfo } from './spo_stock_price_15th_info.entity';
import { SpoEnterpriseCategory } from './spo_entpr_categr.entity';
import { SpoEnterpriseScore } from './spo_entpr_scor.entity';
import { SpoInterestStock } from './spo_interest_stock.entity';
import { SpoStockView } from './spo_stock_view.entity';
import { SpoStockRisk } from './spo_stock_risk.entity';
import { SpoEnterpriseInfo } from './spo_entpr_info.entity';
import { SpoStockPriceYearInfo } from './spo_stock_price_year_info.entity';
import { SpoBoardComment } from './spo_board_comment.entity';
import { SpoUserInvestmentStock } from './spo_user_investment_stock.entity';

@Entity({ name: 'SPO_STK_INFO' })
@Index('idx_crno', ['crno'], { unique: true })
export class SpoStockInfo {
  @PrimaryGeneratedColumn({ name: 'STK_INFO_SEQ' })
  @ApiProperty({ description: '주식 상장 정보 일련번호', example: 1 })
  stockInfoSequence: number;

  @Column({ name: 'BAS_DT' })
  @ApiProperty({ description: '기준일자', example: '20231218' })
  basDt: string;

  @Column({ name: 'CRNO' })
  @ApiProperty({ description: '법인등록번호', example: '1101110043870' })
  crno: string;

  @Column({ name: 'SRTN_CD' })
  @ApiProperty({ description: '단축코드', example: 'A00123' })
  srtnCd: string;

  @Column({ name: 'CORP_NM' })
  @ApiProperty({ description: '법인명', example: '삼성전자' })
  corpNm: string;

  @Column({ name: 'ITMS_NM' })
  @ApiProperty({ description: '종목명', example: '삼성전자' })
  itmsNm: string;

  @Column({ name: 'MRKT_CTG' })
  @ApiProperty({ description: '시장구분', example: 'KOSPI' })
  mrktCtg: string;

  @Column({ name: 'TRAD_SUSPD_YN', default: 'N' })
  @ApiProperty({ description: '거래정지 여부', example: 'N' })
  tradeSuspendYn: string;

  @Column({ name: 'BAD_DATA', default: 'N' })
  @ApiProperty({ description: '부실 데이터 여부', example: 'N' })
  badData: string;

  @UpdateDateColumn({
    name: 'UPDT_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;

  @ApiProperty({ description: '재무제표 정보', type: SpoSummFinaInfo })
  @OneToOne(() => SpoSummFinaInfo, (finaInfo) => finaInfo.stockInfo)
  summFinaInfo: SpoSummFinaInfo;

  @ApiProperty({ description: '손익계산서 정보', type: [SpoIncoInfo] })
  @OneToMany(() => SpoIncoInfo, (incoInfo) => incoInfo.stockInfo)
  incoInfo: SpoIncoInfo[];

  @ApiProperty({ description: '주식 가격 정보', type: SpoStockPriceInfo })
  @OneToOne(() => SpoStockPriceInfo, (priceInfo) => priceInfo.stockInfo)
  priceInfo: SpoStockPriceInfo;

  @ApiProperty({
    description: '15일치 주식 데이터 정보',
    type: [SpoStockPriceInfo],
  })
  @OneToMany(
    () => SpoStockPrice15thInfo,
    (prc15tnMonInfo) => prc15tnMonInfo.stockInfo,
  )
  prc15tnMonInfo: SpoStockPriceInfo[];

  @ApiProperty({
    description: '15일치 주식 데이터 정보',
    type: SpoStockPriceYearInfo,
  })
  @OneToOne(() => SpoStockPriceYearInfo, (prcYearInfo) => prcYearInfo.stockInfo)
  prcYearInfo: SpoStockPriceYearInfo;

  @ApiProperty({
    description: '기업평가항목 정보',
    type: SpoEnterpriseCategory,
  })
  @OneToOne(
    () => SpoEnterpriseCategory,
    (enterCateInfo) => enterCateInfo.stockInfo,
  )
  enterpriseCategories: SpoEnterpriseCategory;

  @OneToOne(
    () => SpoEnterpriseScore,
    (enterScoreInfo) => enterScoreInfo.stockInfo,
  )
  enterpriseScores: SpoEnterpriseScore;

  @OneToMany(() => SpoInterestStock, (interestStock) => interestStock.stockInfo)
  interestStock: SpoInterestStock[];

  @OneToMany(
    () => SpoUserInvestmentStock,
    (userInvestmentStock) => userInvestmentStock.stockInfo,
  )
  userInvestmentStock: SpoUserInvestmentStock[];

  @OneToOne(() => SpoStockView, (stockView) => stockView.stockInfo)
  stockView: SpoStockView;

  @OneToOne(() => SpoStockRisk, (stockRisk) => stockRisk.stockInfo)
  stockRisk: SpoStockRisk;

  @ApiProperty({ description: '기업정보', type: SpoEnterpriseInfo })
  @OneToOne(
    () => SpoEnterpriseInfo,
    (enterpriseInfo) => enterpriseInfo.stockInfo,
  )
  enterpriseInfo: SpoEnterpriseInfo;
}
