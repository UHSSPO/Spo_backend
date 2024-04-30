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

    @InjectRepository(SpoBoardComment)
    private boardCommentRepository: Repository<SpoBoardComment>,

    @InjectRepository(SpoUser)
    private userRepository: Repository<SpoUser>,
  ) {}
  private logger = new Logger(BoardService.name);

  async getAllBoard(): Promise<SpoBoard[]> {
    return await this.boardRepository
      .createQueryBuilder('SB')
      .select([
        'SB.BOARD_SEQ as boardSequence',
        'SB.USR_SEQ as userSequence',
        'SB.TITLE as title',
        'SB.DETAIL as detail',
        'SU.NICK_NAM as nickName',
        'SB.DELE_YN as deleteYn',
        'SB.CRET_AT as createAt',
        'SB.UPDT_AT as updateAt',
      ])
      .innerJoin(SpoUser, 'SU', 'SU.USR_SEQ = SB.USR_SEQ')
      .where('SB.DELE_YN = :deleteYn', {
        deleteYn: 'N',
      })
      .orderBy('SB.CRET_AT', 'DESC')
      .getRawMany();
  }

  async getBoardDetail(boardSequence: number): Promise<any> {
    const spoBoard = await this.boardRepository
      .createQueryBuilder('SB')
      .select([
        'SB.BOARD_SEQ as boardSequence',
        'SB.USR_SEQ as userSequence',
        'SB.TITLE as title',
        'SB.DETAIL as detail',
        'SU.NICK_NAM as nickName',
        'SB.DELE_YN as deleteYn',
        'SB.CRET_AT as createAt',
        'SB.UPDT_AT as updateAt',
      ])
      .innerJoin(SpoUser, 'SU', 'SU.USR_SEQ = SB.USR_SEQ')
      .where('SB.boardSequence = :boardSequence', {
        boardSequence: boardSequence,
      })
      .andWhere('SB.deleteYn = :deleteYn', { deleteYn: 'N' })
      .getRawOne();

    const boardComment = await this.boardCommentRepository
      .createQueryBuilder('SBC')
      .select([
        'SBC.BOARD_COMNT_SEQ as boardCommentSequence',
        'SBC.BOARD_SEQ as boardSequence',
        'SBC.USR_SEQ as userSequence',
        'SBC.COMMENT as comment',
        'SBC.DELE_YN as deleteYn',
        'SBC.CRET_AT as createAt',
        'SBC.UPDT_AT as updateAt',
        'SU.NICK_NAM as nickName',
      ])
      .innerJoin(SpoUser, 'SU', 'SU.USR_SEQ = SBC.USR_SEQ')
      .where('SBC.boardSequence = :boardSequence', {
        boardSequence: boardSequence,
      })
      .andWhere('SBC.deleteYn = :deleteYn', { deleteYn: 'N' })
      .getRawMany();

    const combinedData = {
      spoBoard: spoBoard,
      boardComment: boardComment,
    };
    combinedData.spoBoard.boardComment = boardComment;

    return spoBoard;
  }

  async createBoard(
    { title, detail }: CreateBoardReq,
    user: IUserInterface,
  ): Promise<CreateBoardRes> {
    if (user) {
      await this.dataSource.transaction(async (manager) => {
        const board = new SpoBoard();
        board.userSequence = user.userSequence;
        board.title = title;
        board.detail = detail;
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
    boardSequence: number,
    userInfo: IUserInterface,
  ): Promise<UpdateBoardRes> {
    await this.dataSource.transaction(async (manager) => {
      const board: SpoBoard = await manager.findOne(SpoBoard, {
        where: { boardSequence: boardSequence },
      });
      if (board) {
        if (userInfo.userSequence === board.userSequence) {
          this.logger.log(
            `Board before update ${board.detail}, ${board.title}`,
          );
          await manager.update(
            SpoBoard,
            { boardSequence: boardSequence },
            { title: title, detail: detail },
          );
        } else {
          throw new HttpException('권한이 없습니다.', HttpStatus.UNAUTHORIZED);
        }
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
    userInfo: IUserInterface,
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
        if (userInfo.userSequence === boardComment.userSequence) {
          await manager.update(
            SpoBoardComment,
            { boardCommentSequence: boardCommentSequence },
            { comment: comment },
          );
        } else {
          throw new HttpException('권한이 없습니다.', HttpStatus.UNAUTHORIZED);
        }
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
    userInfo: IUserInterface,
  ): Promise<DeleteBoardCommentRes> {
    await this.dataSource.transaction(async (manager) => {
      const boardComment: SpoBoardComment = await manager.findOne(
        SpoBoardComment,
        {
          where: { boardCommentSequence: boardCommentSequence },
        },
      );

      if (boardComment) {
        if (userInfo.userSequence === boardComment.userSequence) {
          await manager.update(
            SpoBoardComment,
            {
              boardCommentSequence: boardCommentSequence,
            },
            { deleteYn: 'Y' },
          );
        } else {
          throw new HttpException('권한이 없습니다.', HttpStatus.UNAUTHORIZED);
        }
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
