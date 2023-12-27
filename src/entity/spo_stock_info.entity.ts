import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'SPO_STK_INFO' })
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

  @Column({ name: 'MRKT_CTG' })
  @ApiProperty({ description: '시장구분', example: 'KOSPI' })
  mrktCtg: string;

  @UpdateDateColumn({ name: 'UPDT_AT' })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;
}
