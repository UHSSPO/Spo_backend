import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(private readonly http: HttpService) {}
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

    return data;
  }
}
