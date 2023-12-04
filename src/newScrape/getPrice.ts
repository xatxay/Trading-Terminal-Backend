import {
  chatgptClosePositionData,
  extractPriceData,
  subscribeKline,
  unSubscribeKline,
} from './utils.js';
import { V5WsData } from '../interface.js';
// import BybitClient from './bybitClient.js';
import FrontEndWebsocket from './sendFrontEndData.js';
// import { WebsocketClient } from 'bybit-api';
// import EventEmitter from 'events';
import BybitClient from './bybitClient.js';
import { WS_KEY_MAP } from 'bybit-api';

class BybitPrice extends BybitClient {
  // private wsClient: WebsocketClient;
  private dataFrontEnd: FrontEndWebsocket;
  private wsInitialized: boolean = false;

  constructor() {
    super();
    // this.wsClient = new WebsocketClient({
    //   key: process.env.BYBITAPIKEY,
    //   secret: process.env.BYBITSECRET,
    //   market: 'v5',
    // });
    this.dataFrontEnd = new FrontEndWebsocket();
    // this.initializeWebsocket();
    // this.subscribePositions();
  }

  public initializeWebsocket(): void {
    console.log('initing....');
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

        this.dataFrontEnd.sendWebsocketData(priceData);
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
    this.wsInitialized = true;
  }

  public isWsInitialized(): boolean {
    // console.log('isFunction: ', this.wsInitialized);
    return this.wsInitialized;
  }

  private checkSubscribeTopics(): void {
    const activePublicLinearTopics = this.wsClient
      .getWsStore()
      .getTopics(WS_KEY_MAP.v5LinearPublic);
    console.log('Active public linear topic: ', activePublicLinearTopics);
    const activeSubscribeTopic = this.wsClient
      .getWsStore()
      .getTopics(WS_KEY_MAP.v5Private);
    console.log('active subscribe ws v5 topic: ', activeSubscribeTopic);
  }

  public subscribePositions(): void {
    try {
      console.log('subscribing...', this.wsInitialized);
      this.wsClient.subscribeV5('position', 'linear');
      this.checkSubscribeTopics();
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
