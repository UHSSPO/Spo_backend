import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ChangeNickNameReqBody,
  ChangePasswordReqBody,
  DeleteUserReqBody,
  InvestPropensityReqBody,
} from './dto/req.dto';
import { DataSource, Repository } from 'typeorm';
import { SpoUser } from '../../entity/spo_user.entity';
import { IUserInterface } from '../../common/interface/user.interface';
import {
  ChangeNickNameRes,
  ChangePasswordRes,
  DeleteUserRes,
  SelectMyInfoRes,
} from './dto/res.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SpoStockInfo } from '../../entity/spo_stock_info.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';
import { SpoInterestStock } from '../../entity/spo_interest_stock.entity';
import StringUtil from '../../common/util/StringUtil';

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,

    @InjectRepository(SpoUser)
    private userRepository: Repository<SpoUser>,

    @InjectRepository(SpoStockPriceInfo)
    private stockRepository: Repository<SpoStockPriceInfo>,
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
    const userInfo: SpoUser = await this.userRepository.findOne({
      where: {
        userSequence: user.userSequence,
      },
    });

    const interestStock = await this.stockRepository
      .createQueryBuilder('SSPI')
      .select([
        'SSPI.STK_INFO_SEQ as stockInfoSequence',
        'SSPI.ITMS_NM as itmsNm',
        'SSPI.CLPR as clpr',
        'SSPI.FLT_RT as fltRt',
        'SSPI.TRQU as trqu',
        'SSPI.MRKT_TOT_AMT as mrktTotAmt',
      ])
      .innerJoin(SpoStockInfo, 'SSI', 'SSPI.STK_INFO_SEQ = SSI.STK_INFO_SEQ')
      .innerJoin(SpoInterestStock, 'SIS', 'SIS.STK_INFO_SEQ = SSI.STK_INFO_SEQ')
      .where(`SIS.USR_SEQ = ${user.userSequence}`)
      .orderBy('SIS.UPDT_AT', 'ASC')
      .getRawMany();

    if (userInfo) {
      return {
        userSequence: userInfo.userSequence,
        email: userInfo.email,
        investPropensity: userInfo.investPropensity,
        createdAt: userInfo.createdAt,
        userRole: userInfo.userRole,
        nickName: userInfo.nickName,
        dateOfBirth: userInfo.dateOfBirth,
        interestStock: interestStock,
      };
    } else {
      throw new HttpException(
        '존재하지 않는 유저입니다.',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async changePassword(
    { beforePassword, afterPassword }: ChangePasswordReqBody,
    userSequence: number,
  ): Promise<ChangePasswordRes> {
    const userInfo: SpoUser = await this.userRepository.findOne({
      where: { userSequence: userSequence },
    });

    if (userInfo) {
      const match = await compare(beforePassword, userInfo.pwd);
      if (match) {
        await this.dataSource.transaction(async (manager) => {
          const encryptedPassword = await this.encryptPassword(afterPassword);

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

  async changeNickName(
    { changeNickName }: ChangeNickNameReqBody,
    userSequence: number,
  ): Promise<ChangeNickNameRes> {
    await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(SpoUser, {
        where: { userSequence: userSequence },
      });

      const checkNickName = await manager.findOne(SpoUser, {
        where: { nickName: changeNickName },
      });

      if (StringUtil.isNotEmpty(user)) {
        if (StringUtil.isEmpty(checkNickName)) {
          await manager.update(
            SpoUser,
            { userSequence: userSequence },
            { nickName: changeNickName },
          );
        } else {
          throw new HttpException(
            '중목된 닉네임 입니다.',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          '존재하지 않는 유저입니다.',
          HttpStatus.UNAUTHORIZED,
        );
      }
    });

    return { changeNickNameYn: 'Y' };
  }

  async deleteUser(
    userInfo: IUserInterface,
    { password }: DeleteUserReqBody,
  ): Promise<DeleteUserRes> {
    await this.dataSource.transaction(async (manager) => {
      const user: SpoUser = await manager.findOne(SpoUser, {
        where: { userSequence: userInfo.userSequence },
      });

      if (user) {
        const match = await compare(password, user.pwd);

        if (match) {
          await manager.update(
            SpoUser,
            {
              userSequence: userInfo.userSequence,
            },
            {
              deleteYn: 'Y',
            },
          );
        } else {
          throw new HttpException(
            '비밀번호가 일치하지 않습니다.',
            HttpStatus.UNAUTHORIZED,
          );
        }
      }
    });
    return { deleteYn: 'Y' };
  }
}
