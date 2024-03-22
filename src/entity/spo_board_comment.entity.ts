import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SpoUser } from './spo_user.entity';
import { SpoBoard } from './spo_board.entity';

@Entity({ name: 'SPO_BOARD_COMNT' })
export class SpoBoardComment {
  @PrimaryGeneratedColumn({ name: 'BOARD_COMNT_SEQ' })
  @ApiProperty({ description: '게시판 댓글 일련번호', example: 1 })
  boardCommentSequence: number;

  @Column({ name: 'BOARD_SEQ' })
  @ApiProperty({ description: '게시판 일련번호', example: 1 })
  boardSequence: number;

  @Column({ name: 'USR_SEQ' })
  @ApiProperty({ description: '유저 일련 번호', example: 1 })
  userSequence: number;

  @Column({ name: 'COMMENT' })
  @ApiProperty({ description: '댓글', example: '댓글입니다' })
  comment: string;

  @Column({ name: 'NICK_NAM' })
  @ApiProperty({ description: '닉네임', example: '성욱' })
  nickName: string;

  @CreateDateColumn({ name: 'CRET_AT' })
  @ApiProperty({ description: '생성 일자', example: '20231218' })
  createAt: Date;

  @UpdateDateColumn({ name: 'UPDT_AT' })
  @ApiProperty({ description: '업데이트 일자', example: '20231218' })
  updateAt: Date;

  @ManyToOne(() => SpoUser, (user) => user.userSequence)
  @JoinColumn({
    name: 'USR_SEQ',
    referencedColumnName: 'userSequence',
  })
  user: SpoUser;

  @ManyToOne(() => SpoBoard, (board) => board.userSequence)
  @JoinColumn({
    name: 'BOARD_SEQ',
    referencedColumnName: 'boardSequence',
  })
  board: SpoBoard;
}
