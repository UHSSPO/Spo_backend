import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoSummFinaInfo } from './spo_summ_fina_info.entity';
import { SpoIncoInfo } from './spo_inco_info.entity';
import { SpoStkPrcInfo } from './spo_stk_prc_info.entity';
import { SpoStkPricThrMonInfo } from './spo_stk_pric_thr_mon_info.entity';

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

  @Column({ name: 'CORP_NM' })
  @ApiProperty({ description: '법인명', example: '삼성전자' })
  corpNm: string;

  @Column({ name: 'ITMS_NM' })
  @ApiProperty({ description: '종목명', example: '삼성전자' })
  itmsNm: string;

  @Column({ name: 'MRKT_CTG' })
  @ApiProperty({ description: '시장구분', example: 'KOSPI' })
  mrktCtg: string;

  @UpdateDateColumn({
    name: 'UPDT_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;

  @OneToMany(() => SpoSummFinaInfo, (finaInfo) => finaInfo.stockInfo)
  summFinaInfo: SpoSummFinaInfo[];

  @OneToMany(() => SpoIncoInfo, (incoInfo) => incoInfo.stockInfo)
  incoInfo: SpoIncoInfo[];

  @OneToMany(() => SpoStkPrcInfo, (prcInfo) => prcInfo.stockInfo)
  prcInfo: SpoStkPrcInfo[];

  @OneToMany(
    () => SpoStkPricThrMonInfo,
    (prcThrMonInfo) => prcThrMonInfo.stockInfo,
  )
  prcThrMonInfo: SpoStkPrcInfo[];
}
