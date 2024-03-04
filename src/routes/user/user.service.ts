import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InvestPropensityReqBody } from './dto/req.dto';
import { DataSource, Repository } from 'typeorm';
import { SpoUser } from '../../entity/spo_user.entity';
import { IUserInterface } from '../../common/interface/user.interface';
import { SelectMyInfoRes } from './dto/res.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(SpoUser)
    private userRepository: Repository<SpoUser>,
  ) {}

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

  async getUserInfo(user: IUserInterface): Promise<SelectMyInfoRes> {
    const userInfo = await this.userRepository
      .createQueryBuilder('SPU')
      .leftJoinAndSelect('SPU.interestStock', 'interestStock')
      .where('SPU.USR_SEQ = :userSequence', {
        userSequence: user.userSequence,
      })
      .getOne();

    if (userInfo) {
      return {
        userSequence: userInfo.userSequence,
        email: userInfo.email,
        investPropensity: userInfo.investPropensity,
        createdAt: userInfo.createdAt,
        userRole: userInfo.userRole,
        nickName: userInfo.nickName,
        dateOfBirth: userInfo.dateOfBirth,
        interestStock: userInfo.interestStock,
      };
    } else {
      throw new HttpException(
        '존재하지 않는 유저입니다.',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
