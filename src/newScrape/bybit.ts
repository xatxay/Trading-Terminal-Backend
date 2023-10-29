import * as crypto from 'crypto';
import axios from 'axios';
import { RestClientV5 } from 'bybit-api';

class BybitTrading {
  private url: string;
  private apiKey: string;
  private apiSecret: string;
  private timestamp: string;
  private recvWindow: number;
  private client;

  constructor() {
    this.url = process.env.BYBITURL;
    this.apiKey = process.env.BYBITAPIKEY;
    this.apiSecret = process.env.BYBITSECRET;
    this.timestamp = Date.now().toString();
    this.recvWindow = 5000;
    this.client = new RestClientV5({
      key: process.env.BYBITAPIKEY,
      secret: process.env.BYBITSECRET,
    });
  }

  private generateSignature(data: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(this.timestamp + this.apiKey + this.recvWindow + data)
      .digest('hex');
  }

  private async sendRequest(
    endpoint: string,
    method: string,
    data: string,
    Info: string,
  ): Promise<void> {
    const sign = this.generateSignature(data, this.apiSecret);
    let fullendpoint: string;

    if (method === 'POST') {
      fullendpoint = this.url + endpoint;
    } else {
      fullendpoint = this.url + endpoint + '?' + data;
      data = '';
    }

    const headers = {
      'X-BAPI-SIGN-TYPE': '2',
      'X-BAPI-SIGN': sign,
      'X-BAPI-API-KEY': this.apiKey,
      'X-BAPI-TIMESTAMP': this.timestamp,
      'X-BAPI-RECV-WINDOW': this.recvWindow.toString(),
    };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json; charset=utf-8';
    }

    const config = {
      method: method,
      url: fullendpoint,
      headers: headers,
      data: data,
    };

    console.log(Info + 'Calling...');
    await axios(config)
      .then((response) => {
        console.log('sending trade: ', JSON.stringify(response.data));
      })
      .catch((err) => {
        console.log('error sending trade: ', err.response.data);
      });
  }

  public async getWalletBalance(): Promise<void> {
    try {
      const response = await this.client.getWalletBalance({
        accountType: 'UNIFIED',
        coin: 'USDT',
      });
      console.log('balance: ', response.result);
    } catch (err) {
      console.error('Failed getting balance: ', err);
    }
  }

  public async submitOrder(): Promise<void> {
    const orderLinkId = crypto.randomBytes(16).toString('hex');
    const endpoint = '/v5/order/create';
    const data = `{"category":"linear","symbol": "BTCUSDT","side": "Buy","positionIdx": 1,"orderType": "Limit","qty": "0.001","price": "33000","timeInForce": "GTC","orderLinkId": "${orderLinkId}"}`;
    await this.sendRequest(endpoint, 'POST', data, 'Create');
  }
}

export default BybitTrading;
