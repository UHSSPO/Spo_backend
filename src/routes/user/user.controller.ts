import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ChangeNickNameRes,
  ChangePasswordRes,
  DeleteUserRes,
  InvestPropensityRes,
  SelectMyInfoRes,
} from './dto/res.dto';
import { UserService } from './user.service';
import {
  ChangeNickNameReqBody,
  ChangePasswordReqBody,
  DeleteUserReqBody,
  InvestPropensityReqBody,
} from './dto/req.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: SelectMyInfoRes,
  })
  @ApiOperation({
    summary: '내 정보',
  })
  async getUserInfo(@Request() req): Promise<SelectMyInfoRes> {
    return this.userService.getUserInfo(req.user);
  }

  @Put('/change-password/:userSequence')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ChangePasswordRes,
  })
  @ApiOperation({
    summary: '비밀번호 변경',
  })
  async changePassword(
    @Body() reqBody: ChangePasswordReqBody,
    @Param('userSequence') userSequence: number,
  ): Promise<ChangePasswordRes> {
    return this.userService.changePassword(reqBody, userSequence);
  }

  @Put('/change-nickName/:userSequence')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ChangeNickNameRes,
  })
  @ApiOperation({
    summary: '닉네임 변경',
  })
  async changeNickName(
    @Body() reqBody: ChangeNickNameReqBody,
    @Param('userSequence') userSequence: number,
  ): Promise<ChangeNickNameRes> {
    return this.userService.changeNickName(reqBody, userSequence);
  }

  @Put('/invest-propensity/:userSequence')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: InvestPropensityRes,
  })
  @ApiOperation({
    summary: '투자성향분석 등록',
  })
  async userInvestPropensity(
    @Body() reqBody: InvestPropensityReqBody,
    @Param('userSequence') userSequence: number,
  ): Promise<InvestPropensityRes> {
    return this.userService.userInvestPropensity(reqBody, userSequence);
  }

  @Put('/delete')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: DeleteUserRes,
  })
  @ApiOperation({
    summary: '회원 탈퇴',
  })
  async deleteUser(
    @Body() reqBody: DeleteUserReqBody,
    @Request() req,
  ): Promise<DeleteUserRes> {
    return this.userService.deleteUser(req.user, reqBody);
  }
}
