import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateBoardReq {
  @IsNotEmpty({ message: '제목은 필수입니다.' })
  @ApiProperty({
    example: '제목입니다.',
    description: '제목',
    required: true,
  })
  title: string;

  @IsNotEmpty({ message: '내용은 필수입니다.' })
  @ApiProperty({
    example: '내용입니다.',
    description: '내용',
    required: true,
  })
  detail: string;
}

export class UpdateBoardReq {
  @IsOptional()
  @ApiProperty({
    example: '내용입니다.',
    description: '내용',
    required: false,
  })
  detail?: string;

  @IsOptional()
  @ApiProperty({
    example: '내용입니다.',
    description: '내용',
    required: false,
  })
  title?: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '유저 일련번호',
    required: true,
  })
  userSequence: number;
}

export class CreateBoardCommentReq {
  @IsNotEmpty({ message: '댓글 내용을 입력해 주세요.' })
  @MaxLength(50, { message: '댓글은 50자 이내로 작성해 주세요.' })
  @ApiProperty({
    example: '댓글입니다..',
    description: '댓글',
    required: true,
  })
  comment: string;
}

export class UpdateBoardCommentReq {
  @IsNotEmpty({ message: '댓글 내용을 입력해 주세요.' })
  @MaxLength(50, { message: '댓글은 50자 이내로 작성해 주세요.' })
  @ApiProperty({
    example: '댓글입니다..',
    description: '댓글',
    required: true,
  })
  comment: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '유저 일련번호',
    required: true,
  })
  userSequence: string;
}
