import * as crypto from 'crypto';
import {
  RestClientV5,
  OrderTypeV5,
  CategoryV5,
  OrderTimeInForceV5,
} from 'bybit-api';
import { AccountSummary, ResponseBybit } from '../interface.js';

class BybitTrading {
  private client: RestClientV5;
  private category: CategoryV5 = 'linear';
  private orderType: OrderTypeV5 = 'Market'; //change later when use///////!!!!!!@@@@@@
  private quantity: string;
  private timeInForce: OrderTimeInForceV5 = 'GTC';
  private symbol: string;
  private leverage: string = '10';
  private price: string | number;
  private inPosition: number;
  private tp: string;
  private sl: string;
  // private openPosition: unknown;

  constructor(symbol: string) {
    this.client = new RestClientV5({
      key: process.env.BYBITAPIKEY,
      secret: process.env.BYBITSECRET,
      enable_time_sync: true,
    });
    this.symbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
  }

  private async getAssetPrice(): Promise<number> {
    try {
      const response = await this.client.getTickers({
        category: this.category,
        symbol: this.symbol,
      });
      const price = Number(response.result.list[0].lastPrice);
      console.log(`${this.symbol} last price: ${price}`);
      return price;
    } catch (err) {
      console.error('Failed getting asset price: ', err);
      throw err;
    }
  }

  public async getWalletBalance(): Promise<AccountSummary> {
    try {
      const response = await this.client.getWalletBalance({
        accountType: 'UNIFIED',
        coin: 'USDT',
      });
      const accountSummary: AccountSummary = {
        totalEquity: Number(response.result.list[0].totalEquity),
        totalMarginBalance: Number(response.result.list[0].totalMarginBalance),
        totalAvailableBalance: Number(
          response.result.list[0].totalAvailableBalance,
        ),
        totalPerpUPL: Number(response.result.list[0].totalPerpUPL),
      };
      return accountSummary;
    } catch (err) {
      console.error('Failed getting balance: ', err);
      throw err;
    }
  }

  private async calculatePositionSize(percentage: number): Promise<string> {
    try {
      console.log('percentage: ', percentage, typeof percentage);
      const assetPrice = await this.getAssetPrice(),
        { totalAvailableBalance } = await this.getWalletBalance(),
        positionSizeNumber =
          (totalAvailableBalance * Number(this.leverage) * percentage) /
          assetPrice,
        positionSize = positionSizeNumber.toFixed(0).toString();
      console.log('Position size: ', positionSize);
      return positionSize;
    } catch (err) {
      console.error('Failed calculating position size: ', err);
      throw err;
    }
  }

  private async setLeverage(): Promise<void> {
    try {
      const response = await this.client.setLeverage({
        category: 'linear',
        symbol: this.symbol,
        buyLeverage: this.leverage,
        sellLeverage: this.leverage,
      });
      console.log('Setleverage response: ', response);
      // return response;
    } catch (err) {
      console.error('Failed setting leverage: ', err);
      throw err;
    }
  }

  public async isInPosition(): Promise<number> {
    try {
      const response = await this.client.getPositionInfo({
        category: this.category,
        symbol: this.symbol, //change this when use!!!@@@@
      });
      console.log('openorder: ', response.result.list);
      // console.log('OPEN ORDER: ', response.result.list.length);
      return +response.result.list[0].size;
    } catch (err) {
      console.error('Failed getting open order: ', err);
      throw err;
    }
  }

  public async getAllOpenPosition(): Promise<unknown> {
    try {
      const response = await this.client.getPositionInfo({
        category: this.category,
        settleCoin: 'USDT',
      });
      console.log('ALL OPENORDER: ', response.result.list);
      return response.result.list;
    } catch (err) {
      console.log('Error getting all open positions: ', err);
      throw err;
    }
  }

  // public async getPricePercentage(time: number): Promise<void> {
  //   try {
  //     // const time = Date.now();
  //     const response = await this.client.getKline({
  //       category: 'linear',
  //       symbol: 'BTCUSDT',
  //       interval: '1',
  //       start: time,
  //     });
  //     console.log(Date.now());
  //     console.log('price data: ', response.result.list);
  //   } catch (err) {
  //     console.error('Error getting price data: ', err);
  //   }
  // }

  public async getTradeResult(time: number): Promise<void> {
    try {
      const response = await this.client.getClosedPnL({
        category: this.category,
        symbol: this.symbol,
        startTime: time,
        limit: 1,
      });
      console.log('gettraderesult: ', response.result.list);
    } catch (err) {
      console.log('Error getting trade result: ', err);
    }
  }

  public async closeOrder(side: string): Promise<ResponseBybit> {
    const sideDirection = side === 'Buy' ? 'Sell' : 'Buy';
    try {
      const response = await this.client.submitOrder({
        category: this.category,
        symbol: this.symbol,
        side: sideDirection,
        orderType: 'Market',
        qty: '0',
        reduceOnly: true,
        timeInForce: this.timeInForce,
      });
      console.log('Close order response: ', response);
      this.getTradeResult(response.time);
      return response;
    } catch (err) {
      console.error('Error closing order: ', err);
      throw err;
    }
  }

  public async getInstrumentInfo(ticker: string): Promise<number> {
    try {
      const response = await this.client.getInstrumentsInfo({
        category: this.category,
        symbol: ticker,
      });
      console.log('response.retcode: ', response, 'ticker: ', ticker);
      return response.retCode;
    } catch (err) {
      console.log('Error checking instrument: ', err);
      throw err;
    }
  }

  public async submitOrder(side: string, percentage: number): Promise<void> {
    const orderLinkId = crypto.randomBytes(16).toString('hex');
    const direction = side === 'Buy' ? 'Buy' : 'Sell';
    try {
      const checkInstrument = await this.getInstrumentInfo(this.symbol);
      if (checkInstrument !== 0) return;
      await this.setLeverage();

      this.inPosition = await this.isInPosition();
      console.log('this.inposition: ', this.inPosition);
      if (this.inPosition && this.inPosition !== 0) return;

      this.quantity = await this.calculatePositionSize(percentage); //might want to remove this for speed
      this.price = await this.getAssetPrice();
      if (side === 'Buy') {
        this.tp = (this.price * 0.1 + this.price).toString();
        this.sl = (this.price - this.price * 0.02).toString();
      } else {
        this.tp = (this.price - this.price * 0.1).toString();
        this.sl = (this.price + this.price * 0.02).toString();
      }
      // this.price = 0.45; //for testing
      // this.openPosition = await this.getAllOpenPosition();
      // console.log('openposition: ', this.openPosition);

      const response = await this.client.submitOrder({
        category: this.category,
        symbol: this.symbol,
        side: direction,
        orderType: this.orderType,
        qty: this.quantity,
        // price: this.price.toString(),
        timeInForce: this.timeInForce,
        orderLinkId: `${orderLinkId}`,
        takeProfit: `${this.tp}`,
        stopLoss: `${this.sl}`,
      });

      console.log('Submit order response: ', response);
    } catch (err) {
      console.error('Failed submitting order: ', err);
    }
  }
}

export default BybitTrading;
