import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardRes {
  @ApiProperty({
    example: 'Y',
    description: '등록여부',
    required: true,
  })
  createBoard: string;
}

export class UpdateBoardRes {
  @ApiProperty({
    example: 'Y',
    description: '수정여부',
    required: true,
  })
  updateYn: string;
}

export class DeleteBoardRes {
  @ApiProperty({
    example: 'Y',
    description: '삭제여부',
    required: true,
  })
  deleteYn: string;
}

export class CreateBoardCommentRes {
  @ApiProperty({
    example: 'Y',
    description: '등록여부',
    required: true,
  })
  createYn: string;
}

export class UpdateBoarCommentRes {
  @ApiProperty({
    example: 'Y',
    description: '업데이트 여부',
    required: true,
  })
  updateYn: string;
}

export class DeleteBoardCommentRes {
  @ApiProperty({
    example: 'Y',
    description: '삭제여부',
    required: true,
  })
  deleteYn: string;
}
