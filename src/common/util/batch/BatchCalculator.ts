import { SpoStockPrice15thInfo } from '../../../entity/spo_stock_price_15th_info.entity';

export class BatchCalculator {
  // 부채비율 점수 계산
  public static getFinancialStatementDebtRatioScore(
    financialStatementDebtRatio: number,
  ): number {
    let financialStatementDebtRatioScore = 0;
    if (financialStatementDebtRatio >= 0 && financialStatementDebtRatio < 20) {
      financialStatementDebtRatioScore = 5;
    } else if (
      financialStatementDebtRatio >= 20 &&
      financialStatementDebtRatio < 40
    ) {
      financialStatementDebtRatioScore = 4;
    } else if (
      financialStatementDebtRatio >= 40 &&
      financialStatementDebtRatio < 60
    ) {
      financialStatementDebtRatioScore = 3;
    } else if (
      financialStatementDebtRatio >= 60 &&
      financialStatementDebtRatio < 80
    ) {
      financialStatementDebtRatioScore = 2;
    } else {
      financialStatementDebtRatioScore = 1;
    }

    return financialStatementDebtRatioScore;
  }

  public static getRoaScore(roa: number): number {
    let roaScore;
    if (roa <= 15) {
      roaScore = 5;
    } else if (roa >= 10 && roa < 15) {
      roaScore = 4;
    } else if (roa >= 5 && roa < 10) {
      roaScore = 3;
    } else if (roa >= 1 && roa < 5) {
      roaScore = 2;
    } else {
      roaScore = 1;
    }

    return roaScore;
  }

  // 이동평균선 계산
  public static calculateMovingAverage(
    stock15thPriceInfos: SpoStockPrice15thInfo[],
  ): string {
    // basDt를 기준으로 날짜순으로 정렬
    const sortedStock15thPriceInfos = [...stock15thPriceInfos].sort(
      (a, b) => parseInt(a.basDt, 10) - parseInt(b.basDt, 10),
    );

    let result = '';
    let today = 0;
    let yesterday = 0;

    for (let i = 0; i < sortedStock15thPriceInfos.length - 1; i++) {
      today += sortedStock15thPriceInfos[i].clpr;
    }

    for (let i = 0; i < sortedStock15thPriceInfos.length; i++) {
      if (i === 0) {
        yesterday = 0;
      } else {
        yesterday += sortedStock15thPriceInfos[i].clpr;
      }
    }

    today = today / sortedStock15thPriceInfos.length - 1;
    yesterday = yesterday / sortedStock15thPriceInfos.length - 1;

    if (today > yesterday) {
      result = 'UP';
    } else if (today < yesterday) {
      result = 'DOWN';
    } else {
      result = 'FLUC';
    }

    return result;
  }
}
