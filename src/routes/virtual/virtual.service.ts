import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IUserInterface } from '../../common/interface/user.interface';
import { DataSource } from 'typeorm';
import { SpoUserInvestment } from '../../entity/spo_user_investment.entity';
import StringUtil from '../../common/util/StringUtil';
import {
  BuyStockInvestmentRes,
  SelectUserInvestmentStart,
  SellStockInvestmentRes,
} from './dto/res.dto';
import { BuyStockInvestmentReq, SellStockInvestmentReq } from './dto/req.dto';
import { SpoUserInvestmentStock } from '../../entity/spo_user_investment_stock.entity';
import { SpoUserInvestmentHistory } from '../../entity/spo_user_investment_history.entity';
import { SpoStockInfo } from '../../entity/spo_stock_info.entity';
import { SpoStockPriceInfo } from '../../entity/spo_stock_price_info.entity';

@Injectable()
export class VirtualService {
  constructor(private dataSource: DataSource) {}

  async selectUserInvestmentStart(
    userInfo: IUserInterface,
  ): Promise<SelectUserInvestmentStart> {
    let startInvestmentYn = '';
    await this.dataSource.transaction(async (manager) => {
      const userInvestment = await manager.findOne(SpoUserInvestment, {
        where: { userSequence: userInfo.userSequence },
      });

      if (StringUtil.isNotEmpty(userInvestment)) {
        startInvestmentYn = 'N';
      } else {
        startInvestmentYn = 'Y';
      }
    });

    return {
      startInvestmentYn: startInvestmentYn,
    };
  }

  async startVirtualInvestment(userInfo: IUserInterface): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userInvestment = new SpoUserInvestment();

      const checkUserInvestment = await manager.findOne(SpoUserInvestment, {
        where: { userSequence: userInfo.userSequence },
      });

      if (StringUtil.isEmpty(checkUserInvestment)) {
        userInvestment.userSequence = userInfo.userSequence;
        userInvestment.amount = 1000000;
        userInvestment.valueAmount = 1000000;

        await manager.save(userInvestment);
      } else {
        throw new HttpException(
          '이미 가상투자를 시작한 유저입니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  }

  async buyStockInvestment(
    { stockInfoSequence, quantity }: BuyStockInvestmentReq,
    userInfo: IUserInterface,
  ): Promise<BuyStockInvestmentRes> {
    await this.dataSource.transaction(async (manager) => {
      const userInvestmentStock = new SpoUserInvestmentStock();
      const userInvestmentStockHistory = new SpoUserInvestmentHistory();

      const stockInfo = await manager.findOne(SpoStockInfo, {
        where: { stockInfoSequence: stockInfoSequence },
      });
      const stockPriceInfo = await manager.findOne(SpoStockPriceInfo, {
        where: { stockInfoSequence: stockInfoSequence },
      });
      const userInvestmentStockInfo = await manager.findOne(
        SpoUserInvestmentStock,
        {
          where: {
            stockInfoSequence: stockInfoSequence,
            userSequence: userInfo.userSequence,
          },
        },
      );
      const userInvestInfo = await manager.findOne(SpoUserInvestment, {
        where: { userSequence: userInfo.userSequence },
      });

      if (userInvestInfo.amount < quantity * stockPriceInfo.clpr) {
        throw new HttpException(
          '보유중인 금액보다 투자금액이 초과했습니다.',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        // 거래내역 저장
        userInvestmentStockHistory.userSequence = userInfo.userSequence;
        userInvestmentStockHistory.itmsNm = stockInfo.itmsNm;
        userInvestmentStockHistory.buySell = 'BUY';
        userInvestmentStockHistory.quantity = quantity;

        // 첫 구매 주식
        if (StringUtil.isEmpty(userInvestmentStockInfo)) {
          userInvestmentStock.stockInfoSequence = stockInfoSequence;
          userInvestmentStock.userSequence = userInfo.userSequence;
          userInvestmentStock.quantity = quantity;
          userInvestmentStock.itemBuyAmount = stockPriceInfo.clpr * quantity;

          await Promise.all([
            manager.save(SpoUserInvestmentStock, userInvestmentStock),
            manager.save(SpoUserInvestmentHistory, userInvestmentStockHistory),
            manager.update(
              SpoUserInvestment,
              {
                userInvestmentSequence: userInvestInfo.userInvestmentSequence,
              },
              {
                amount:
                  userInvestInfo.amount - userInvestmentStock.itemBuyAmount,
                buyAmount:
                  userInvestInfo.buyAmount + userInvestmentStock.itemBuyAmount,
              },
            ),
          ]);
        } else {
          // 추가 매수 주식 (수익률 배치 돌기 전 추매)
          if (!userInvestmentStockInfo.itemFltRt) {
            await Promise.all([
              manager.update(
                SpoUserInvestmentStock,
                {
                  userInvestmentStockSequence:
                    userInvestmentStockInfo.userInvestmentStockSequence,
                },
                {
                  itemBuyAmount:
                    userInvestmentStockInfo.itemBuyAmount +
                    stockPriceInfo.clpr * quantity,
                  quantity: userInvestmentStockInfo.quantity + quantity,
                },
              ),
              manager.update(
                SpoUserInvestment,
                {
                  userInvestmentSequence: userInvestInfo.userInvestmentSequence,
                },
                {
                  amount:
                    userInvestInfo.amount - stockPriceInfo.clpr * quantity,
                  buyAmount:
                    userInvestInfo.buyAmount + stockPriceInfo.clpr * quantity,
                },
              ),
              manager.save(
                SpoUserInvestmentHistory,
                userInvestmentStockHistory,
              ),
            ]);
          } else {
            // 수익률 계산 후 추가 매수
          }
        }
      }
    });

    return {
      buyStockYn: 'Y',
    };
  }

  async sellStockInvestment(
    { stockInfoSequence, quantity }: SellStockInvestmentReq,
    userInfo: IUserInterface,
  ): Promise<SellStockInvestmentRes> {
    await this.dataSource.transaction(async (manager) => {
      const userInvestmentStockHistory = new SpoUserInvestmentHistory();

      const stockInfo = await manager.findOne(SpoStockInfo, {
        where: { stockInfoSequence: stockInfoSequence },
      });
      const stockPriceInfo = await manager.findOne(SpoStockPriceInfo, {
        where: { stockInfoSequence: stockInfoSequence },
      });
      const userInvestmentStockInfo = await manager.findOne(
        SpoUserInvestmentStock,
        {
          where: {
            stockInfoSequence: stockInfoSequence,
            userSequence: userInfo.userSequence,
          },
        },
      );
      const userInvestInfo = await manager.findOne(SpoUserInvestment, {
        where: { userSequence: userInfo.userSequence },
      });

      if (userInvestmentStockInfo.quantity < quantity) {
        throw new HttpException(
          '보유중인 주식보다 매도량이 초과했습니다.',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        // 거래내역 저장
        userInvestmentStockHistory.userSequence = userInfo.userSequence;
        userInvestmentStockHistory.itmsNm = stockInfo.itmsNm;
        userInvestmentStockHistory.buySell = 'SELL';
        userInvestmentStockHistory.quantity = quantity;
        if (!userInvestmentStockInfo.itemFltRt) {
          await Promise.all([
            userInvestmentStockInfo.quantity === quantity
              ? // 전량 매도
                manager.delete(SpoUserInvestmentStock, {
                  userInvestmentStockSequence:
                    userInvestmentStockInfo.userInvestmentStockSequence,
                })
              : // 부분 매도
                manager.update(
                  SpoUserInvestmentStock,
                  {
                    userInvestmentStockSequence:
                      userInvestmentStockInfo.userInvestmentStockSequence,
                  },
                  {
                    itemBuyAmount:
                      userInvestmentStockInfo.itemBuyAmount -
                      stockPriceInfo.clpr * quantity,
                    quantity: userInvestmentStockInfo.quantity - quantity,
                  },
                ),
            manager.update(
              SpoUserInvestment,
              {
                userInvestmentSequence: userInvestInfo.userInvestmentSequence,
              },
              {
                amount: userInvestInfo.amount + stockPriceInfo.clpr * quantity,
                buyAmount:
                  userInvestInfo.buyAmount - stockPriceInfo.clpr * quantity,
              },
            ),
            manager.save(SpoUserInvestmentHistory, userInvestmentStockHistory),
          ]);
        }
      }
    });
    return {
      sellStockYn: 'Y',
    };
  }
}
