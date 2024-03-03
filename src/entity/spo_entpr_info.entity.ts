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

@Entity({ name: 'SPO_ENTPR_INFO' })
export class SpoEnterpriseInfo {
  @PrimaryGeneratedColumn({ name: 'ENTPR_INFO_SEQ' })
  @ApiProperty({ description: '기업 정보 일련번호', example: 11 })
  enterpriseInfoSequence: number;

  @Column({ name: 'STK_INFO_SEQ' })
  @ApiProperty({ description: '주식 상장 정보 일련번호', example: 1 })
  stockInfoSequence: number;

  @Column({ name: 'CRNO' })
  @ApiProperty({ description: '법인등록번호', example: '112324123' })
  crno: string;

  @Column({ name: 'CORP_NM' })
  @ApiProperty({ description: '법인명', example: '삼성전자' })
  corpNm: string;

  @Column({ name: 'ENP_RPR_FNM' })
  @ApiProperty({ description: '대표이사 명', example: '김성욱' })
  enpRprFnm: string;

  @Column({ name: 'ENP_BSADR', nullable: true })
  @ApiProperty({ description: '기업기본주소', example: '서울시 강남구' })
  enpBsadr: string;

  @Column({ name: 'ENP_HMPG_URL', nullable: true })
  @ApiProperty({ description: '기업홉페이지', example: 'https:www.' })
  enpHmpgUrl: string;

  @Column({ name: 'ENP_TLNO', nullable: true })
  @ApiProperty({ description: '기업전화번호', example: '03112314123' })
  enpTlno: string;

  @Column({ name: 'ENP_ESTB_DT', nullable: true })
  @ApiProperty({ description: '기업설립일자', example: '20251231' })
  enpEstbDt: string;

  @Column({ name: 'ENP_EMPE_CNT', nullable: true })
  @ApiProperty({ description: '기업종업원수', example: 12 })
  enpEmpeCnt: number;

  @Column({ name: 'ENP_MAIN_BIZ_NM', nullable: true })
  @ApiProperty({ description: '기업주요사업명', example: '전자' })
  enpMainBizNm: string;

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
