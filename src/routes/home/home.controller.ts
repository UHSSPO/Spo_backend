import { Controller, Get } from '@nestjs/common';
import { MarketIndexResDto } from './dto/res.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';

@ApiTags('Home')
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
