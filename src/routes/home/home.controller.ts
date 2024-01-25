import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { MarketIndexResDto } from './dto/res.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { SuccessInterceptor } from '../../common/interceptor/success.interceptor';

@ApiTags('Home')
@UseInterceptors(SuccessInterceptor)
@Controller('home')
export class HomeController {
  constructor(private homeService: HomeService) {}
  @Get('/market-index')
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: MarketIndexResDto,
  })
  async getHomeMarketIndex(): Promise<MarketIndexResDto[]> {
    return await this.homeService.getHomeMarketIndex();
  }
}
