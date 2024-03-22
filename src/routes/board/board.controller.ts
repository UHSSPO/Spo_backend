import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBoardRes, DeleteBoardRes, UpdateBoardRes } from './dto/res.dto';
import { BoardService } from './board.service';
import { CreateBoardReq, UpdateBoardReq } from './dto/req.dto';
import { SpoBoard } from '../../entity/spo_board.entity';

@ApiTags('board')
@Controller('board')
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [SpoBoard],
  })
  @ApiOperation({
    summary: '게시판 전체 조회 api',
  })
  async getAllBoard(): Promise<SpoBoard[]> {
    return await this.boardService.getAllBoard();
  }

  @Get('/:boardSequence')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: SpoBoard,
  })
  @ApiOperation({
    summary: '게시판 상세 조회 api',
  })
  async getBoardDetail(
    @Param('boardSequence') boardSequence: number,
  ): Promise<SpoBoard> {
    return await this.boardService.getBoardDetail(boardSequence);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: CreateBoardRes,
  })
  @ApiOperation({
    summary: '게시판 글 생성 api',
  })
  async createBoard(
    @Body() reqBody: CreateBoardReq,
    @Request() req,
  ): Promise<CreateBoardRes> {
    return await this.boardService.createBoard(reqBody, req.user);
  }

  @Put('/:boardSequence')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: UpdateBoardRes,
  })
  @ApiOperation({
    summary: '게시판 글 수정 api',
  })
  async updateBoard(
    @Param('boardSequence') boardSequence: number,
    @Body() reqBody: UpdateBoardReq,
    @Request() req,
  ): Promise<UpdateBoardRes> {
    if (req.user.userSequence === reqBody.userSequence) {
      return await this.boardService.updateBoard(reqBody, boardSequence);
    } else {
      throw new HttpException('권한이 없습니다.', HttpStatus.UNAUTHORIZED);
    }
  }

  @Delete('/:boardSequence')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: DeleteBoardRes,
  })
  @ApiOperation({
    summary: '게시판 글 삭제 api',
  })
  async deleteBoard(
    @Param('boardSequence') boardSequence: number,
    @Request() req,
  ): Promise<DeleteBoardRes> {
    return await this.boardService.deleteBoard(req.user, boardSequence);
  }
}
