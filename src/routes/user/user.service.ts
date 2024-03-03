import { Injectable } from '@nestjs/common';
import { InvestPropensityReqBody } from './dto/req.dto';
import { DataSource } from 'typeorm';
import { SpoUser } from '../../entity/spo_user.entity';

@Injectable()
export class UserService {
  constructor(private dataSource: DataSource) {}
  async userInvestPropensity(
    reqBody: InvestPropensityReqBody,
    userSequence: number,
  ) {
    let investPropensity = '';
    if (reqBody.totalScore >= 81) {
      investPropensity = '05';
    } else if (reqBody.totalScore >= 61) {
      investPropensity = '04';
    } else if (reqBody.totalScore >= 41) {
      investPropensity = '03';
    } else if (reqBody.totalScore >= 21) {
      investPropensity = '02';
    } else {
      investPropensity = '01';
    }
    await this.dataSource.transaction(async (manager) => {
      const userInfo = await manager.findOne(SpoUser, {
        where: { userSequence: userSequence },
      });
      if (userInfo) {
        await manager.update(
          SpoUser,
          { userSequence: userSequence },
          { investPropensity: investPropensity },
        );
      }
    });

    return { investPropensity: investPropensity };
  }
}
