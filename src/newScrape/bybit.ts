import * as crypto from 'crypto';
import {
  RestClientV5,
  OrderTypeV5,
  CategoryV5,
  OrderTimeInForceV5,
} from 'bybit-api';
import { AccountSummary } from '../interface.js';

class BybitTrading {
  private client: RestClientV5;
  private category: CategoryV5 = 'linear';
  private orderType: OrderTypeV5 = 'Limit'; //change later when use///////!!!!!!@@@@@@
  private quantity: string;
  private timeInForce: OrderTimeInForceV5 = 'GTC';
  private symbol: string;
  private leverage: string = '10';
  private price: string | number;
  private inPosition: number;
  private openPosition: unknown;

  constructor(symbol: string) {
    this.client = new RestClientV5({
      key: process.env.BYBITAPIKEY,
      secret: process.env.BYBITSECRET,
      enable_time_sync: true,
    });
    this.symbol = symbol;
  }

  private async getAssetPrice(): Promise<number> {
    try {
      const response = await this.client.getTickers({
        category: this.category,
        symbol: this.symbol,
      });
      console.log('this.client: ');
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

  private async calculatePositionSize(): Promise<string> {
    try {
      const assetPrice = await this.getAssetPrice(),
        { totalAvailableBalance } = await this.getWalletBalance(),
        positionSizeNumber =
          totalAvailableBalance * Number(this.leverage) * 0.25 * assetPrice,
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
    } catch (err) {
      console.error('Failed setting leverage: ', err);
    }
  }

  private async isInPosition(): Promise<number> {
    try {
      const response = await this.client.getPositionInfo({
        category: this.category,
        symbol: 'BTCUSDT', //change this when use!!!@@@@
      });
      console.log('OPEN ORDER: ', response.result.list.length);
      return response.result.list.length;
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

  public async getPricePercentage(time: number): Promise<void> {
    try {
      // const time = Date.now();
      const response = await this.client.getKline({
        category: 'linear',
        symbol: 'BTCUSDT',
        interval: '1',
        start: time,
      });
      console.log(Date.now());
      console.log('price data: ', response.result.list);
    } catch (err) {
      console.error('Error getting price data: ', err);
    }
  }

  public async submitOrder(): Promise<void> {
    const orderLinkId = crypto.randomBytes(16).toString('hex');
    try {
      await this.setLeverage();
      this.quantity = await this.calculatePositionSize();
      // this.price = await this.getAssetPrice();
      this.price = 0.45; //for testing
      this.openPosition = await this.getAllOpenPosition();
      console.log('openposition: ', this.openPosition);

      this.inPosition = await this.isInPosition();
      if (this.inPosition !== 0) return;

      const response = await this.client.submitOrder({
        category: this.category,
        symbol: this.symbol,
        side: 'Buy',
        orderType: this.orderType,
        qty: this.quantity,
        price: this.price.toString(),
        timeInForce: this.timeInForce,
        orderLinkId: `${orderLinkId}`,
      });

      console.log('Submit order response: ', response);
    } catch (err) {
      console.error('Failed submitting order: ', err);
    }
  }
}

export default BybitTrading;
