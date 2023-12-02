import FrontEndWebsocket from './sendFrontEndData.js';
import {
  chatgptClosePositionData,
  extractPriceData,
  subscribeKline,
  unSubscribeKline,
} from './utils.js';
import { V5WsData } from '../interface.js';
import BybitClient from './bybitClient.js';

class BybitPrice extends BybitClient {
  constructor() {
    super();
    this.initializeWebsocket();
    this.subscribePositions();
  }

  private initializeWebsocket(): void {
    if (!this.wsClient) return;
    this.wsClient.on('update', async (data: V5WsData) => {
      if (data.topic === 'position' && !data.data[0].side) {
        const positionResult = {
          positionEnterTime: Date.now() - 1 * 60 * 1000,
          symbol: data.data[0].symbol,
        };
        await chatgptClosePositionData(
          positionResult.symbol,
          positionResult.positionEnterTime,
        );
        console.log('position update: ', data);
      } else if (data.wsKey === 'v5LinearPublic') {
        const priceData = extractPriceData(data);

        const frontEndData = new FrontEndWebsocket();
        frontEndData.sendWebsocketData(priceData);
        this.emit('percentage', priceData);
        console.log('Price update: ', priceData);
      }
    });

    this.wsClient.on('open', () => {
      console.log('Websocket opened');
    });

    this.wsClient.on('reconnect', () => {
      console.log('Reconnecting...');
    });

    this.wsClient.on('reconnected', () => {
      console.log('Reconnected');
    });

    this.wsClient.on('response', (data) => {
      console.log('Log response: ', JSON.stringify(data, null, 2));
    });
  }

  private subscribePositions(): void {
    try {
      if (!this.wsClient) return;
      this.wsClient.subscribeV5('position', 'linear');
    } catch (err) {
      console.error('Error subscribing to positions: ', err);
    }
  }

  public subscribeV5(ticker: string): void {
    try {
      subscribeKline(this.wsClient, ticker);
    } catch (err) {
      console.log('Error subscribing to kline: ', err);
    }
  }

  public unsubscribeV5(ticker: string): void {
    try {
      unSubscribeKline(this.wsClient, ticker);
    } catch (err) {
      console.error('Error unsubscribing Kline: ', err);
    }
  }
}

export { FrontEndWebsocket, BybitPrice };
