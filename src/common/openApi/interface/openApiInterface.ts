export interface IKrxListedInfoRes {
  resultCode: string; // 결과 코드
  resultMsg: string; // 결과 메시지
  numOfRows: number; // 한 페이지 결과 수
  pageNo: number; // 페이지 번호
  totalCount: number; // 전체 결과 수
  basDt: string; // 기준 일자 (YYYYMMDD 조회의 기준일, 통상 거래일)
  srtnCd: string; // 단축 코드 (종목코드보다 짧으면서 유일성이 보장되는 코드)
  isinCd: string; // ISIN 코드 (국제 채권 식별번호. 유가증권(채권)의 국제인증 고유번호)
  mrktCtg: string; // 시장 구분 (KOSPI/KOSDAQ/KONEX 등)
  itmsNm: string; // 종목명 (유가증권 국제인증 고유번호 코드 이름)
  crno: string; // 법인 등록 번호 (종목의 법인 등록 번호)
  corpNm: string; // 법인명 (종목의 법인 명칭)
}

export interface IFinaStatInfoRes {
  resultCode: string; // 결과 코드
  resultMsg: string; // 결과 메시지
  numOfRows: number; // 한 페이지 결과 수
  pageNo: number; // 페이지 번호
  totalCount: number; // 전체 결과 수
  basDt: string; // 기준 일자 (YYYYMMDD 조회의 기준일, 통상 거래일)
  crno: string; // 법인 등록 번호 (종목의 법인 등록 번호)
  curCd?: string; // 통화 코드
  bizYear: string; // 사업 연도 (법인에 대해 법령이 규정한 1회계기간으로서 법인세의 과세기간)
  fnclDcd: string; // 재무제표 구분 코드 (기업이 회계 연도가 끝나는 때에 결산 보고를 하기 위하여 작성하는 회계 보고서를 구분하는 코드)
  fnclDcdNm?: string; // 재무제표 구분 코드명
  enpSaleAmt: number; // 기업 매출 금액
  enpBzopPft: number; // 기업 영업 이익
  iclsPalClcAmt: number; // 포괄손익계산금액
  enpCrtmNpf: number; // 기업 당기 순이익
  enpTastAmt: number; // 기업 총 자산 금액
  enpTdbtAmt: number; // 기업 총 부채 금액
  enpTcptAmt: number; // 기업 총 자본 금액
  enpCptlAmt: number; // 기업 자본 금액
  fnclDebtRto: number; // 재무제표 부채 비율
  srtnCd: string; // 단축 코드 (종목코드보다 짧으면서 유일성이 보장되는 코드)
  isinCd: string; // ISIN 코드 (국제 채권 식별번호. 유가증권(채권)의 국제인증 고유번호)
  mrktCtg: string; // 시장 구분 (KOSPI/KOSDAQ/KONEX 등)
  itmsNm: string; // 종목명 (유가증권 국제인증 고유번호 코드 이름)
  corpNm: string; // 법인명 (종목의 법인 명칭)
}

export interface IIncoStatInfoRes {
  resultCode: string; // 결과 코드
  resultMsg: string; // 결과 메시지
  numOfRows: number; // 한 페이지 결과 수
  pageNo: number; // 페이지 번호
  totalCount: number; // 전체 결과 수
  basDt: string; // 기준 일자 (YYYYMMDD 조회의 기준일, 통상 거래일)
  crno: string; // 법인 등록 번호 (종목의 법인 등록 번호)
  curCd?: string; // 통화 코드
  bizYear: string; // 사업 연도 (법인에 대해 법령이 규정한 1회계기간으로서 법인세의 과세기간)
  fnclDcd: string; // 재무제표 구분 코드 (기업이 회계 연도가 끝나는 때에 결산 보고를 하기 위하여 작성하는 회계 보고서를 구분하는 코드)
  fnclDcdNm?: string; // 재무제표 구분 코드명
  acitId: string; // 계정과목ID
  acitNm: string; // 계정과목명
  thqrAcitAmt: number; // 당분기계정과목금액
  crtmAcitAmt: number; // 당기계정과목금액
  lsqtAcitAmt: number; // 전분기계정과목금액
  pvtrAcitAmt: number; // 전기계정과목금액
  bpvtrAcitAmt: number; // 전전기계정과목금액
  enpSaleAmt: number; // 기업 매출 금액
  enpBzopPft: number; // 기업 영업 이익
  iclsPalClcAmt: number; // 포괄손익계산금액
  enpCrtmNpf: number; // 기업 당기 순이익
  enpTastAmt: number; // 기업 총 자산 금액
  enpTdbtAmt: number; // 기업 총 부채 금액
  enpTcptAmt: number; // 기업 총 자본 금액
  enpCptlAmt: number; // 기업 자본 금액
  fnclDebtRto: number; // 재무제표 부채 비율
  srtnCd: string; // 단축 코드 (종목코드보다 짧으면서 유일성이 보장되는 코드)
  isinCd: string; // ISIN 코드 (국제 채권 식별번호. 유가증권(채권)의 국제인증 고유번호)
  mrktCtg: string; // 시장 구분 (KOSPI/KOSDAQ/KONEX 등)
  itmsNm: string; // 종목명 (유가증권 국제인증 고유번호 코드 이름)
  corpNm: string; // 법인명 (종목의 법인 명칭)
}

export interface IStockPriceInfoRes {
  resultCode: string; // API 호출 결과의 상태 코드
  resultMsg: string; // API 호출 결과의 상태
  numOfRows: number; // 한 페이지 결과 수
  pageNo: number; // 페이지 번호
  totalCount: number; // 전체 결과 수
  basDt: string; // 기준일자
  srtnCd: string; // 단축코드
  isinCd: string; // ISIN코드
  itmsNm: string; // 종목명
  mrktCtg: string; // 시장구분
  clpr: number; // 종가
  vs: number; // 대비
  fltRt: number; // 등락률
  mkp: number; // 시가
  hipr: number; // 고가
  lopr: number; // 저가
  trqu: number; // 거래량
  trPrc: number; // 거래대금
  lstgStCnt: number; // 상장주식수
  mrktTotAmt: number; // 시가총액
}
