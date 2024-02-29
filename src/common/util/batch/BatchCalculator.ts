import { SpoStockPrice15thInfo } from '../../../entity/spo_stock_price_15th_info.entity';

export class BatchCalculator {
  // 부채비율 점수 계산
  public static getFinancialStatementDebtRatioScore(
    financialStatementDebtRatio: number,
  ): number {
    let financialStatementDebtRatioScore = 0;

    if (financialStatementDebtRatio >= 0 && financialStatementDebtRatio < 20) {
      financialStatementDebtRatioScore = 3;
    } else if (financialStatementDebtRatio < 40) {
      financialStatementDebtRatioScore = 2;
    } else if (financialStatementDebtRatio < 60) {
      financialStatementDebtRatioScore = 1;
    }

    return financialStatementDebtRatioScore;
  }

  public static getRoaScore(roa: number): number {
    let roaScore = 0;

    if (roa >= 10) {
      roaScore = 3;
    } else if (roa >= 5) {
      roaScore = 2;
    } else if (roa >= 1) {
      roaScore = 1;
    }

    return roaScore;
  }

  public static getRoeScore(roe: number): number {
    let roeScore = 0;

    if (roe >= 10) {
      roeScore = 3;
    } else if (roe >= 5) {
      roeScore = 2;
    } else if (roe >= 1) {
      roeScore = 1;
    }

    return roeScore;
  }

  public static getPbrScore(pbr: number): number {
    let pbrScore = 0;

    if (pbr <= 0.5) {
      pbrScore = 5;
    } else if (pbr < 0.8) {
      pbrScore = 4;
    } else if (pbr < 1.2) {
      pbrScore = 3;
    } else if (pbr < 2) {
      pbrScore = 2;
    } else {
      pbrScore = 1;
    }

    return pbrScore;
  }

  public static getPerScore(per: number): number {
    let perScore = 0;

    if (per <= 10) {
      perScore = 5;
    } else if (per < 15) {
      perScore = 4;
    } else if (per < 20) {
      perScore = 3;
    } else if (per < 25) {
      perScore = 2;
    } else {
      perScore = 1;
    }

    return perScore;
  }

  public static getSalesGrowthRateScore(salesGrowthRate: number): number {
    let salesGrowthRateScore = 0;

    if (salesGrowthRate >= 10) {
      salesGrowthRateScore = 3;
    } else if (salesGrowthRate >= 5) {
      salesGrowthRateScore = 2;
    } else if (salesGrowthRate >= 1) {
      salesGrowthRateScore = 1;
    }

    return salesGrowthRateScore;
  }

  public static getIncomeBeforeTaxExpenseDiff(
    incomeBeforeTaxExpenseDiff,
  ): number {
    let incomeBeforeTaxExpenseDiffScore = 0;

    if (incomeBeforeTaxExpenseDiff >= 10) {
      incomeBeforeTaxExpenseDiffScore = 3;
    } else if (incomeBeforeTaxExpenseDiff >= 5) {
      incomeBeforeTaxExpenseDiffScore = 2;
    } else if (incomeBeforeTaxExpenseDiff >= 1) {
      incomeBeforeTaxExpenseDiffScore = 1;
    }

    return incomeBeforeTaxExpenseDiffScore;
  }

  public static getMoveAverageScore(moveAverage: string): number {
    let moveAverageScore = 0;

    if (moveAverage === 'UP') {
      moveAverageScore = 7;
    } else if (moveAverage === 'DOWN') {
      moveAverageScore = 3;
    } else {
      moveAverageScore = 5;
    }

    return moveAverageScore;
  }

  public static getVolumeScore(volume: number): number {
    let volumeScore = 0;

    if (volume > 0) {
      volumeScore = 7;
    } else if (volume < 0) {
      volumeScore = 3;
    } else {
      volumeScore = 5;
    }

    return volumeScore;
  }

  public static getChangeMarketGapScore(changeMarketGap: number): number {
    let changeMarketGapScore = 0;

    if (changeMarketGap >= 15) {
      changeMarketGapScore = 7;
    } else if (changeMarketGap >= 10) {
      changeMarketGapScore = 6;
    } else if (changeMarketGap >= 5) {
      changeMarketGapScore = 5;
    } else if (changeMarketGap >= 0) {
      changeMarketGapScore = 4;
    } else {
      changeMarketGapScore = 3;
    }

    return changeMarketGapScore;
  }

  public static getVolumeRatioScore(volumeRatio: number): number {
    let volumeRatioScore = 0;

    if (volumeRatio >= 2) {
      volumeRatioScore = 7;
    } else if (volumeRatio >= 1.5) {
      volumeRatioScore = 6;
    } else if (volumeRatio >= 1) {
      volumeRatioScore = 5;
    } else if (volumeRatio >= 0.5) {
      volumeRatioScore = 4;
    } else {
      volumeRatioScore = 3;
    }

    return volumeRatioScore;
  }

  public static getRating(totalScore: number): string {
    let rating = '';

    if (totalScore >= 40) {
      rating = 'A';
    } else if (totalScore >= 30) {
      rating = 'B';
    } else if (totalScore >= 20) {
      rating = 'C';
    } else if (totalScore >= 15) {
      rating = 'D';
    } else {
      rating = 'E';
    }

    return rating;
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

  public static getStandardDeviation(clprArray: number[]): number {
    // 평균 계산
    const mean =
      clprArray.reduce((sum, value) => sum + value, 0) / clprArray.length;

    // 각 데이터와 평균의 차이의 제곱 계산
    const squaredDeviations = clprArray.map((value) =>
      Math.pow(value - mean, 2),
    );

    // 평균 제곱 편차 계산
    const meanSquaredDeviation =
      squaredDeviations.reduce((sum, value) => sum + value, 0) /
      clprArray.length;

    // 표준편차 계산
    const standardDeviation = Math.sqrt(meanSquaredDeviation);

    // 백분율로 변환
    const standardDeviationPercent = ((standardDeviation / mean) * 100).toFixed(
      2,
    );

    return Number(standardDeviationPercent);
  }

  public static getRisk(
    standardDeviation: number,
    percentageDifference: number,
  ): string {
    const score = ((standardDeviation + percentageDifference) / 2).toFixed(2);
    let risk = '';
    if (Number(score) >= 5) {
      risk = '05';
    } else if (Number(score) >= 3) {
      risk = '04';
    } else if (Number(score) >= 1) {
      risk = '03';
    } else if (Number(score) >= 0.5) {
      risk = '02';
    } else {
      risk = '01';
    }

    return risk;
  }
}
