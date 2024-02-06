import {
  Column,
  Entity,
  Index,
  ManyToMany,
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
import { SpoUser } from './spo_user.entity';
import { SpoInterestStock } from './spo_interest_stock.entity';
import { SpoStockView } from './spo_stock_view.entity';

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

  @OneToOne(() => SpoSummFinaInfo, (finaInfo) => finaInfo.stockInfo)
  summFinaInfo: SpoSummFinaInfo;

  @OneToMany(() => SpoIncoInfo, (incoInfo) => incoInfo.stockInfo)
  incoInfo: SpoIncoInfo[];

  @OneToOne(() => SpoStockPriceInfo, (prcInfo) => prcInfo.stockInfo)
  prcInfo: SpoStockPriceInfo;

  @OneToMany(
    () => SpoStockPrice15thInfo,
    (prc15tnMonInfo) => prc15tnMonInfo.stockInfo,
  )
  prc15tnMonInfo: SpoStockPriceInfo[];

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

  @OneToOne(() => SpoStockView, (stockView) => stockView.stockInfo)
  stockView: SpoStockView;
}
