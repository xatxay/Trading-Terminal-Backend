import { WebsocketClient } from 'bybit-api';
import { dataFrontEnd } from './classInstance.js';
import EventEmitter from 'events';
import { extractPriceData } from './utils.js';
import { subscribeKline, unSubscribeKline } from './utils.js';

class KlineClient extends EventEmitter {
  private klineClient: WebsocketClient;
  private isInit: boolean;

  constructor() {
    super();
    this.klineClient = new WebsocketClient({
      market: 'v5',
    });
    this.isInit = false;
  }

  public clientInit(): void {
    console.log('subinit: ', this.isInit);
    if (this.isInit) return;
    this.klineClient.on('update', (data) => {
      if (data.wsKey === 'v5LinearPublic') {
        const priceData = extractPriceData(data);

        dataFrontEnd.sendWebsocketData(priceData);
        this.emit('percentage', priceData);
        console.log('Price update: ', priceData);
      }
    });
    this.klineClient.on('open', () => {
      console.log('Websocket opened');
    });

    this.klineClient.on('reconnect', () => {
      console.log('Reconnecting...');
    });

    this.klineClient.on('reconnected', () => {
      console.log('Reconnected');
    });

    this.klineClient.on('response', (data) => {
      console.log('Log response: ', JSON.stringify(data, null, 2));
    });
    this.isInit = true;
  }

  public subscribeV5(ticker: string): void {
    try {
      console.log('subscribe ticker: ', ticker);
      subscribeKline(this.klineClient, ticker);
    } catch (err) {
      console.log('Error subscribing to kline: ', err);
    }
  }

  public unsubscribeV5(ticker: string): void {
    try {
      unSubscribeKline(this.klineClient, ticker);
    } catch (err) {
      console.error('Error unsubscribing Kline: ', err);
    }
  }
}

export default KlineClient;
