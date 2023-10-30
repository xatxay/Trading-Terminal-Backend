import * as crypto from 'crypto';
import {
  RestClientV5,
  OrderTypeV5,
  CategoryV5,
  OrderTimeInForceV5,
} from 'bybit-api';

class BybitTrading {
  private client: RestClientV5;
  private category: CategoryV5 = 'linear';
  private orderType: OrderTypeV5 = 'Limit'; //change later when use///////!!!!!!@@@@@@
  private quantity: string;
  private timeInForce: OrderTimeInForceV5 = 'GTC';
  private symbol: string;
  private leverage: string = '10';
  private price: string | number;

  constructor(symbol: string) {
    this.client = new RestClientV5({
      key: process.env.BYBITAPIKEY,
      secret: process.env.BYBITSECRET,
    });
    this.symbol = symbol;
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

  private async getWalletBalance(): Promise<number> {
    try {
      const response = await this.client.getWalletBalance({
        accountType: 'UNIFIED',
        coin: 'USDT',
      });
      const totalWalletBalance = response.result.list[0].totalWalletBalance;
      console.log('balance: ', totalWalletBalance);
      return Number(totalWalletBalance);
    } catch (err) {
      console.error('Failed getting balance: ', err);
      throw err;
    }
  }

  private async calculatePositionSize(): Promise<string> {
    try {
      const assetPrice = await this.getAssetPrice(),
        walletBalance = await this.getWalletBalance(),
        positionSizeNumber =
          walletBalance * Number(this.leverage) * 0.25 * assetPrice,
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

  public async submitOrder(): Promise<void> {
    const orderLinkId = crypto.randomBytes(16).toString('hex');
    try {
      await this.setLeverage();
      this.quantity = await this.calculatePositionSize();
      this.price = await this.getAssetPrice();

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
