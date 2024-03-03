import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvestPropensityRes } from './dto/res.dto';
import { UserService } from './user.service';
import { InvestPropensityReqBody } from './dto/req.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

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
