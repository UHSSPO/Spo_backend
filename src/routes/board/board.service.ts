import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBoardRes, DeleteBoardRes, UpdateBoardRes } from './dto/res.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SpoBoard } from '../../entity/spo_board.entity';
import { DataSource, Repository } from 'typeorm';
import { SpoUser } from '../../entity/spo_user.entity';
import { CreateBoardReq, UpdateBoardReq } from './dto/req.dto';
import { IUserInterface } from '../../common/interface/user.interface';

@Injectable()
export class BoardService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(SpoBoard)
    private boardRepository: Repository<SpoBoard>,

    @InjectRepository(SpoUser)
    private userRepository: Repository<SpoUser>,
  ) {}

  async getAllBoard(): Promise<SpoBoard[]> {
    return this.boardRepository.find({
      where: { deleteYn: 'N' },
      order: {
        createAt: 'DESC',
      },
    });
  }

  async getBoardDetail(boardSequence: number): Promise<SpoBoard> {
    return this.boardRepository.findOne({
      where: { boardSequence: boardSequence, deleteYn: 'N' },
    });
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
      await manager.update(
        SpoBoard,
        { boardSequence: boardSequence },
        { title: title, detail: detail },
      );
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
}
