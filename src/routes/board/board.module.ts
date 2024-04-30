import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpoBoard } from '../../entity/spo_board.entity';
import { SpoUser } from '../../entity/spo_user.entity';
import { SpoBoardComment } from '../../entity/spo_board_comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpoBoard, SpoUser, SpoBoardComment])],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
