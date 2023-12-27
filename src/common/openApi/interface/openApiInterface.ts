export default interface IKrxListedInfoRes {
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
