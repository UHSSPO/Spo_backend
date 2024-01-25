import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'SPO_MRKT_IDX' })
@Index('idx_idxNm', ['idxNm'], { unique: true })
export class SpoMarketIndex {
  @PrimaryGeneratedColumn({ name: 'MRKT_IDX_SEQ' })
  @ApiProperty({ description: '주가지수 및 파생상품지수 일련번호', example: 1 })
  marketIndexSequence: number;

  @Column({ name: 'IDX_NM' })
  @ApiProperty({ description: '지수명', example: '코스피 200' })
  idxNm: string;

  @Column({ name: 'CLPR', type: 'double' })
  @ApiProperty({ description: '종가', example: 3000 })
  clpr: number;

  @Column({ name: 'VS', type: 'double' })
  @ApiProperty({ description: '대비', example: 200 })
  vs: number;

  @Column({ name: 'FLT_RT', type: 'double' })
  @ApiProperty({ description: '등락률', example: 1.3 })
  fltRt: number;

  @UpdateDateColumn({ name: 'UPDT_AT' })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;
}
