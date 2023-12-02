import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Spo_User } from '../../entity/spo_user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly http: HttpService,
    @InjectRepository(Spo_User)
    private userRepository: Repository<Spo_User>,
    private configService: ConfigService,
    private dataSource: DataSource,
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

    const response = {
      nickName: data.kakao_account.profile.nickname,
      email: data.kakao_account.email,
    };

    return response;
  }

  async signUp(reqBody: CreateUserDto): Promise<Spo_User> {
    const user = await this.getUserByUserEmail(reqBody.email);

    if (!user) {
      const encryptedPassword = await this.encryptPassword(reqBody.pw);
      const savedUser = await this.dataSource.transaction(async (manager) => {
        const user = new Spo_User();
        user.email = reqBody.email;
        user.pwd = encryptedPassword;
        user.signInChannel = reqBody.signInChannel;
        user.userRole = 'USR';
        user.nickName = reqBody.nickName;
        user.dataOfBirth = reqBody.dataOfBirth;

        await manager.save(user);
        return user;
      });
      return savedUser;
    } else {
      throw new HttpException(
        '이미 가입된 회원입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getUserByUserEmail(email: string) {
    return await this.userRepository.findOneBy({
      email,
    });
  }

  async encryptPassword(password: string) {
    const numberSalt = parseInt(
      this.configService.get<string>('DEFAULT_SALT'),
      10,
    );
    return hash(password, numberSalt);
  }
}
