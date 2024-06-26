import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { SpoUser } from '../../entity/spo_user.entity';
import { CreateUserDto } from './dto/req.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginResDto } from './dto/res.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly http: HttpService,
    @InjectRepository(SpoUser)
    private userRepository: Repository<SpoUser>,
    private configService: ConfigService,
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {}
  async kakaoLogin(apikey: string, redirectUri: string, code: string) {
    const config = {
      grant_type: 'authorization_code',
      client_id: apikey,
      redirect_uri: redirectUri,
      code,
    };
    const params = new URLSearchParams(config).toString();
    const tokenHeaders = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const tokenUrl = `https://kauth.kakao.com/oauth/token`;

    const res = await this.http
      .post(tokenUrl, params, { headers: tokenHeaders })
      .pipe()
      .toPromise();

    const userInfoUrl = `https://kapi.kakao.com/v2/user/me`;
    const userInfoHeaders = {
      Authorization: `Bearer ${res.data.access_token}`,
    };
    const { data } = await firstValueFrom(
      this.http.get(userInfoUrl, { headers: userInfoHeaders }),
    );

    const user = await this.getUserByUserEmail(data.kakao_account.email);

    const response = {
      nickName: data.kakao_account.profile.nickname,
      email: data.kakao_account.email,
      check: !!user && user.deleteYn === 'Y',
    };

    return response;
  }

  async signUp(reqBody: CreateUserDto): Promise<SpoUser> {
    const userInfo = await this.getUserByUserEmailDelete(reqBody.email);

    if (!userInfo || userInfo.deleteYn === 'Y') {
      const encryptedPassword = await this.encryptPassword(reqBody.pwd);
      const savedUser = await this.dataSource.transaction(async (manager) => {
        const user = new SpoUser();
        if (!userInfo) {
          user.email = reqBody.email;
          user.pwd = encryptedPassword;
          user.signUpChannel = reqBody.signUpChannel;
          user.userRole = 'USR';
          user.nickName = reqBody.nickName;
          user.dateOfBirth = reqBody.dateOfBirth;
          user.deleteYn = 'N';
          await manager.save(user);
          return user;
        } else if (userInfo.deleteYn === 'Y') {
          await manager.update(
            SpoUser,
            { userSequence: userInfo.userSequence },
            {
              deleteYn: 'N',
              pwd: encryptedPassword,
              nickName: reqBody.nickName,
            },
          );
          return userInfo;
        }
      });
      return savedUser;
    } else {
      throw new HttpException(
        '이미 가입된 회원입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async login(req: SpoUser): Promise<LoginResDto> {
    const payload = {
      userSequence: req.userSequence,
      email: req.email,
      nickName: req.nickName,
      userRole: req.userRole,
      signUpChannel: req.signUpChannel,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: req,
    };
  }

  async getUserByUserEmail(email: string): Promise<SpoUser> {
    return await this.userRepository.findOneBy({
      email,
      deleteYn: 'N',
    });
  }

  async getUserByUserEmailDelete(email: string): Promise<SpoUser> {
    return await this.userRepository.findOneBy({
      email,
    });
  }

  async encryptPassword(password: string): Promise<string> {
    const numberSalt = parseInt(
      this.configService.get<string>('DEFAULT_SALT'),
      10,
    );
    return hash(password, numberSalt);
  }

  async validateUser(email: string, pwd: string): Promise<SpoUser> {
    const user = await this.getUserByUserEmail(email);

    if (user) {
      const match = await compare(pwd, user.pwd);
      if (match) {
        return user;
      } else {
        return null;
      }
    }
  }
}
