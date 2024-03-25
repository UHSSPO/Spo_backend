import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  CreateBoardCommentRes,
  CreateBoardRes,
  DeleteBoardCommentRes,
  DeleteBoardRes,
  UpdateBoarCommentRes,
  UpdateBoardRes,
} from './dto/res.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SpoBoard } from '../../entity/spo_board.entity';
import { DataSource, Repository } from 'typeorm';
import { SpoUser } from '../../entity/spo_user.entity';
import {
  CreateBoardCommentReq,
  CreateBoardReq,
  UpdateBoardCommentReq,
  UpdateBoardReq,
} from './dto/req.dto';
import { IUserInterface } from '../../common/interface/user.interface';
import { SpoBoardComment } from '../../entity/spo_board_comment.entity';

@Injectable()
export class BoardService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(SpoBoard)
    private boardRepository: Repository<SpoBoard>,

    @InjectRepository(SpoUser)
    private userRepository: Repository<SpoUser>,
  ) {}
  private logger = new Logger(BoardService.name);

  async getAllBoard(): Promise<SpoBoard[]> {
    return this.boardRepository.find({
      where: { deleteYn: 'N' },
      order: {
        createAt: 'DESC',
      },
    });
  }

  async getBoardDetail(boardSequence: number): Promise<SpoBoard> {
    return await this.boardRepository
      .createQueryBuilder('SB')
      .select()
      .leftJoinAndSelect('SB.boardComment', 'boardComment')
      .where('SB.boardSequence = :boardSequence', {
        boardSequence,
      })
      .getOne();
  }

  async createBoard(
    { title, detail }: CreateBoardReq,
    user: IUserInterface,
  ): Promise<CreateBoardRes> {
    const userInfo = await this.userRepository.findOne({
      where: { userSequence: user.userSequence },
    });

    if (user) {
      await this.dataSource.transaction(async (manager) => {
        const board = new SpoBoard();
        board.userSequence = user.userSequence;
        board.title = title;
        board.detail = detail;
        board.nickName = userInfo.nickName;
        board.deleteYn = 'N';

        await manager.save(SpoBoard, board);
      });
      return {
        createBoard: 'Y',
      };
    } else {
      throw new HttpException(
        '존재하지 않는 유저입니다.',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateBoard(
    { title, detail }: UpdateBoardReq,
    boardSequence,
  ): Promise<UpdateBoardRes> {
    await this.dataSource.transaction(async (manager) => {
      const board: SpoBoard = await manager.findOne(SpoBoard, {
        where: { boardSequence: boardSequence },
      });
      if (board) {
        this.logger.log(`Board before update ${board.detail}, ${board.title}`);
        await manager.update(
          SpoBoard,
          { boardSequence: boardSequence },
          { title: title, detail: detail },
        );
      } else {
        throw new HttpException(
          '존재하지 않는 게시글입니다.',
          HttpStatus.NOT_FOUND,
        );
      }
    });
    return { updateYn: 'Y' };
  }

  async deleteBoard(
    user: IUserInterface,
    boardSequence: number,
  ): Promise<DeleteBoardRes> {
    await this.dataSource.transaction(async (manager) => {
      const board: SpoBoard = await manager.findOne(SpoBoard, {
        where: {
          boardSequence: boardSequence,
        },
      });
      if (board) {
        if (board.userSequence === user.userSequence) {
          await manager.update(
            SpoBoard,
            { boardSequence: boardSequence },
            { deleteYn: 'Y' },
          );
        } else {
          throw new HttpException('권한이 없습니다.', HttpStatus.UNAUTHORIZED);
        }
      } else {
        throw new HttpException(
          '존재하지 않는 게시물 입니다.',
          HttpStatus.NOT_FOUND,
        );
      }
    });
    return {
      deleteYn: 'Y',
    };
  }

  async createBoardComment(
    { comment }: CreateBoardCommentReq,
    boardSequence: number,
    user: IUserInterface,
  ): Promise<CreateBoardCommentRes> {
    await this.dataSource.transaction(async (manager) => {
      const board: SpoBoard = await manager.findOne(SpoBoard, {
        where: { boardSequence: boardSequence },
      });

      const userInfo: SpoUser = await manager.findOne(SpoUser, {
        where: { userSequence: user.userSequence },
      });

      if (board && userInfo) {
        const boardComment = new SpoBoardComment();
        boardComment.userSequence = userInfo.userSequence;
        boardComment.boardSequence = boardSequence;
        boardComment.nickName = userInfo.nickName;
        boardComment.comment = comment;
        boardComment.deleteYn = 'N';

        await manager.save(SpoBoardComment, boardComment);
      } else {
        throw new HttpException('잘못된 접근입니다.', HttpStatus.NOT_FOUND);
      }
    });

    return {
      createYn: 'Y',
    };
  }

  async updateBoardComment(
    { comment }: UpdateBoardCommentReq,
    boardCommentSequence: number,
  ): Promise<UpdateBoarCommentRes> {
    await this.dataSource.transaction(async (manager) => {
      const boardComment: SpoBoardComment = await manager.findOne(
        SpoBoardComment,
        {
          where: {
            boardCommentSequence: boardCommentSequence,
          },
        },
      );

      this.logger.log(`Comment before update ${boardComment.comment}`);

      if (boardComment) {
        await manager.update(
          SpoBoardComment,
          { boardCommentSequence: boardCommentSequence },
          { comment: comment },
        );
      } else {
        throw new HttpException(
          '존재하지 않는 댓글입니다.',
          HttpStatus.NOT_FOUND,
        );
      }
    });

    return {
      updateYn: 'Y',
    };
  }

  async deleteBoardComment(
    boardCommentSequence: number,
  ): Promise<DeleteBoardCommentRes> {
    await this.dataSource.transaction(async (manager) => {
      const boardComment = await manager.findOne(SpoBoardComment, {
        where: { boardCommentSequence: boardCommentSequence },
      });

      if (boardComment) {
        await manager.update(
          SpoBoardComment,
          {
            boardCommentSequence: boardCommentSequence,
          },
          { deleteYn: 'Y' },
        );
      } else {
        throw new HttpException(
          '존재하지 않는 댓글 입니다.',
          HttpStatus.NOT_FOUND,
        );
      }
    });

    return {
      deleteYn: 'Y',
    };
  }
}
