export default class OpenApi {
  // 주식발행정보
  public static readonly GetKrxListedInfoService: string =
    'https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo';

  // 요약재무제표
  public static readonly GetFinaStatInfoService: string =
    'http://apis.data.go.kr/1160100/service/GetFinaStatInfoService_V2/getSummFinaStat_V2';

  // 손익계산서
  public static readonly GetIncoStatInfoService: string =
    'http://apis.data.go.kr/1160100/service/GetFinaStatInfoService_V2/getIncoStat_V2';

  // 주식 시세 정보
  public static readonly GetStockPriceInfoService: string =
    'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';

  // 주가 지수 시세
  public static readonly GetStockMarketIndexService: string =
    'https://apis.data.go.kr/1160100/service/GetMarketIndexInfoService/getStockMarketIndex';

  // 파상생품 지수 시세
  public static readonly GetDerivationMarketIndexService: string =
    'https://apis.data.go.kr/1160100/service/GetMarketIndexInfoService/getDerivationProductMarketIndex';
}
