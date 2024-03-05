import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChangePasswordReqBody, InvestPropensityReqBody } from './dto/req.dto';
import { DataSource, Repository } from 'typeorm';
import { SpoUser } from '../../entity/spo_user.entity';
import { IUserInterface } from '../../common/interface/user.interface';
import { ChangePasswordRes, SelectMyInfoRes } from './dto/res.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
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
      } else {
        throw new HttpException(
          '존재하지 않는 유저입니다.',
          HttpStatus.NOT_FOUND,
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

  async changePassword(
    reqBody: ChangePasswordReqBody,
    userSequence: number,
  ): Promise<ChangePasswordRes> {
    const userInfo: SpoUser = await this.userRepository.findOne({
      where: { userSequence: userSequence },
    });

    if (userInfo) {
      const match = await compare(reqBody.beforePassword, userInfo.pwd);
      if (match) {
        await this.dataSource.transaction(async (manager) => {
          const encryptedPassword = await this.encryptPassword(
            reqBody.afterPassword,
          );

          await manager.update(
            SpoUser,
            { userSequence: userSequence },
            { pwd: encryptedPassword },
          );
        });
        return {
          changePasswordYn: 'Y',
        };
      } else {
        throw new HttpException(
          '현재 패스워드가 일치하지 않습니다.',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  async encryptPassword(password: string): Promise<string> {
    const numberSalt = parseInt(
      this.configService.get<string>('DEFAULT_SALT'),
      10,
    );
    return hash(password, numberSalt);
  }
}
