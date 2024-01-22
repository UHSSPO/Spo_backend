import numeral from 'numeral';
import { DateTime, Interval } from 'luxon';
import _ from 'lodash';

export default class StringUtil {
  // 숫자 콤마(,) 처리
  public static setNumberComma(
    value: string | number,
    decimal?: number,
  ): string {
    return numeral(value).format(
      '0,0'.concat(decimal ? '.' + '0'.repeat(decimal) : ''),
    );
  }

  // 숫자 콤마(,) 처리
  public static setDecimalNumberComma(value: string | number): string {
    return numeral(value).format('0,0.00');
  }

  public static setCurrencyNumberComma(
    value: string | number,
    currency: string,
  ) {
    if (currency === 'KRW') {
      return numeral(value).format('0,0');
    } else {
      return numeral(value).format('0,0.00');
    }
  }

  public static setNumberFormat(value: number | null, format: string): string {
    return _.isNumber(value) ? numeral(value).format(format) : '';
  }

  // 날짜관련
  public static getCurrentDate(dateFormat?: string): string {
    return DateTime.local()
      .setLocale('ko')
      .toFormat(dateFormat || 'yyyy-LL-dd');
  }

  public static getCurrentDateTime(dateTimeFormat?: string): string {
    return DateTime.local()
      .setLocale('ko')
      .toFormat(dateTimeFormat || 'yyyy-LL-dd HH:mm:ss');
  }

  public static getCurrentYear(dateTimeFormat?: string): string {
    return DateTime.local()
      .setLocale('ko')
      .toFormat(dateTimeFormat || 'yyyy');
  }

  public static getYesterdayDate(dateTimeFormat?: string) {
    let days = 1;
    let yesterday = DateTime.local()
      .setLocale('ko')
      .minus({ days: days })
      .toFormat(dateTimeFormat || 'yyyyLLdd');
    while (this.getHoliday(yesterday) || this.isWeekend(yesterday)) {
      days += 1;
      yesterday = DateTime.local()
        .setLocale('ko')
        .minus({ days: days })
        .toFormat(dateTimeFormat || 'yyyyLLdd');
    }

    return yesterday;
  }

  public static isWeekend(date: string) {
    const parsedDate = DateTime.fromFormat(date, 'yyyyMMdd');
    const dayOfWeek = parsedDate.weekday;

    // 1은 월요일, 5는 금요일
    return dayOfWeek === 6 || dayOfWeek === 7;
  }

  public static getThreeMonthDate(dateTimeFormat?: string) {
    let days = 90;
    let threeMonthDate = DateTime.local()
      .setLocale('ko')
      .minus({ days: days })
      .toFormat(dateTimeFormat || 'yyyyLLdd');
    while (this.getHoliday(threeMonthDate) || this.isWeekend(threeMonthDate)) {
      days += 1;
      threeMonthDate = DateTime.local()
        .setLocale('ko')
        .minus({ days: days })
        .toFormat(dateTimeFormat || 'yyyyLLdd');
    }

    return threeMonthDate;
  }

  public static getHoliday(str: string) {
    const holiday = {
      '2023': {
        '10': ['3', '9', '14', '15'],
        '11': [],
        '12': ['25', '29', '30', '31'],
      },
      '2024': {
        '01': ['01'],
        '02': ['09', '10', '11', '12'],
        '03': ['01'],
        '04': ['10'],
        '05': ['01', '05', '06', '15'],
        '06': ['06'],
        '07': [],
        '08': ['15'],
        '09': ['16', '17', '18'],
        '10': ['03', '09'],
        '11': [],
        '12': ['25'],
      },
    };

    const year = str.slice(0, 4);
    const month = str.slice(4, 6);
    const date = str.slice(6, 8);

    return holiday[year][month].includes(date);
  }

  public static getDateMonthPlus(
    value: number,
    dateTimeFormat?: string,
  ): string {
    return DateTime.local()
      .setLocale('ko')
      .plus({ months: value })
      .toFormat(dateTimeFormat || 'yyyy-LL-dd');
  }

  public static getDaysBetween(
    startDate: string,
    endDate: string,
  ): Array<string> {
    const interval = Interval.fromDateTimes(
      DateTime.fromISO(startDate),
      DateTime.fromISO(endDate),
    );
    const result = [];
    for (const day of this.days(interval)) {
      result.push(day.toFormat('yyyy-LL-dd'));
    }
    return result;
  }

  private static *days(interval: Interval) {
    let cursor = interval.start.startOf('day');
    while (cursor < interval.end) {
      yield cursor;
      cursor = cursor.plus({ days: 1 });
    }
  }

  /**
   * 빈값 체크
   */
  public static isEmpty(value: any): boolean {
    return (
      value === undefined ||
      value === null ||
      // eslint-disable-next-line use-isnan
      (typeof value === 'object' && _.isEmpty(value)) ||
      (typeof value === 'string' && value.trim().length === 0)
    );
  }

  public static isNotEmpty(value: any): boolean {
    return !this.isEmpty(value);
  }

  /**
   * 원 단위 치환
   * @param value
   * @param won 원 단위
   * @param decimal 소수점 단위
   */
  public static setWonUnit(
    value: string | number,
    won?: number,
    decimal?: number,
  ): string | number {
    if (won && won > 0) {
      value = Number(value) / (won as number);
    }
    if (StringUtil.isNotEmpty(decimal) && Number(decimal) >= 0) {
      value =
        Math.floor(Number(value) * Math.pow(10, Number(decimal))) /
        Math.pow(10, Number(decimal));
    }
    return value;
  }

  public static isNumber(value: any) {
    return _.isNumber(value);
  }
}
