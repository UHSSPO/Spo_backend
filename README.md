## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.
### BackEnd 개발 기여도
   - @KurtDev599 : 100%
1. #### 개발의도 <br />
   처음 투자를 시작하게 되면 어려운 투자 용어들과 PER, PBR, 재무제표, 손익계산서 등 초보자가 이해하기 어렵고 난해합니다.
   하지만 투자를 시작할때 반드시 알아야 하는 지표와 데이터 들이며 주식을 투자하기 위해 공부하는 시간을 절약하고
   저희가 분석한 데이터를 토대로 주식 투자를 할 때 참고 데이터로 활용하여 누구나 투자를 쉽게 할 수 있도록 유도하기 위해 개발했습니다.
2. #### 주요기능 <br />
   1. 단기투자와 장기투자 별 추천 
   2. 거래량 기반 인기종목
   3. 조회수, 등락률 별 테마 탐색
   4. 개인 투자 성향 분석
   5. 투자 성향 분석을 통한 개인 맞춤 추천
   6. 개인 맞춤 종목을 통한 가상투자 및 포트폴리오 구성과 가상투자 수익률 랭킹
   7. 투자 조언 및 투자의견 소통 가능한 게시판
3. #### 기능 구현 소개 <br />
    1. 금융위원회에서 제공해주는 주식 발행정보, 최근 주식 가격, 재무제표, 손익계산서를 이용하여 PER, PBR 매출성장률, 순이익, 재무제표 부채비율, ROE, ROA, 3개월 주가 등락률, 거래량, 시가총액 변화량, 시가총액 기준 거래대금 비율, 이동평균선을 이용해 기업을 평가
    2. 주식의 표준편차와 최고가와 최저가의 차이를 분석하여 주식의 위험도를 분석 및 개인 투자자의 설문을 통해 투자 성향 분석 
    3. 위 데이터를 종합하여 개인 맞춤형 주식 추천
4. #### 개발 프로세스
   1. 에자일 프로세스를 통해 주 1회 스프린트와 주1회 배포
   2. Git Flow를 통한 형상관리
   3. Code Review를 통한 버그최소화, Code Convention 관리, Clean Code 적용

## Auth
    1. 카카오 Login Api를 통해 사용자의 email 추출
    2. bcrypt를 통한 패스워드 단방향 암호화 및 Jwt를 사용하여 로그인, 로그아웃 처리
    3. Passport 미들웨어를 통해 AuthGuard를 개발하여 인증 처리 및 Strategy 패턴을 사용해 인증전략 모듈화

## DataBase
    1. MriaDB와 AWS RDS를 통해 별도 데이터베이스 서버 및 관리
    2. TypeORM을 사용하여 간단한 쿼리는 TypeORM 내장함수를 사용하고 복잡한 로직은 QueryBuilder 사용
    3. 데이터베이스 스키마 변경시 TypeORM Migration을 활용
    4. TypeOrm DataSource Transaction을 사용해 insert, update, delete 로직에 Transaction 처리  

## Batch
    1. NestJs Schedule 사용하여 배치 구현 
    2. 재무제표, 손익계산서, 주가 정보, 가상투자 수익률 등 배치를 통해 매일 업데이트
    3. 주말 및 공휴일에 배치가 돌지 않도록 설정

## 배포 주소
1. [SPO 홈페이지](http://uhs-spo.kro.kr/home)
2. [Swagger](http://43.201.117.252:3001/api)
3. [ERD](https://www.erdcloud.com/d/YR5oLSEYSv58Foj6b)

## Installation

```bash
$ yarn install
```

## Running the app
.env 파일 @KurtDev599 요청

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```
