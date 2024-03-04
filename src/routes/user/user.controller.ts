import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvestPropensityRes, SelectMyInfoRes } from './dto/res.dto';
import { UserService } from './user.service';
import { InvestPropensityReqBody } from './dto/req.dto';
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
}
