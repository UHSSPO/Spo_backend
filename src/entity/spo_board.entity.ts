import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoUser } from './spo_user.entity';
import { SpoBoardComment } from './spo_board_comment.entity';

@Entity({ name: 'SPO_BOARD' })
export class SpoBoard {
  @PrimaryGeneratedColumn({ name: 'BOARD_SEQ' })
  @ApiProperty({ description: '게시판 일련번호', example: 1 })
  boardSequence: number;

  @Column({ name: 'USR_SEQ' })
  @ApiProperty({ description: '유저 일련 번호', example: 1 })
  userSequence: number;

  @Column({ name: 'TITLE', type: 'text' })
  @ApiProperty({ description: '제목', example: '제목입니다.' })
  title: string;

  @Column({ name: 'DETAIL', type: 'text' })
  @ApiProperty({ description: '내용', example: '내용입니다.' })
  detail: string;

  @Column({ name: 'DELE_YN', default: 'N' })
  @ApiProperty({ description: '삭제여부', example: 'Y' })
  deleteYn: string;

  @CreateDateColumn({ name: 'CRET_AT' })
  @ApiProperty({ description: '생성 일자', example: '20231218' })
  createAt: Date;

  @UpdateDateColumn({ name: 'UPDT_AT' })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;

  @ManyToOne(() => SpoUser, (user) => user.board)
  @JoinColumn({
    name: 'USR_SEQ',
    referencedColumnName: 'userSequence',
  })
  user: SpoUser;

  @OneToMany(() => SpoBoardComment, (boardComment) => boardComment.board)
  @ApiProperty({ description: '게시판', type: [SpoBoardComment] })
  boardComment: SpoBoardComment[];
}
