import WebSocket from 'ws';
import { WebsocketClient } from 'bybit-api';
import {
  chatgptClosePositionData,
  extractPriceData,
  subscribeKline,
  unSubscribeKline,
} from './utils.js';
import { PriceData, V5WsData } from '../interface.js';
import EventEmitter from 'events';

abstract class FrontEndWebsocket extends EventEmitter {
  private ws: WebSocket.Server;
  constructor() {
    super();
    this.ws = new WebSocket.Server({ port: 8080 });
    this.startWebsocket();
  }

  private startWebsocket(): void {
    this.ws.on('connection', (wss) => {
      console.log('Frontend client connected');

      wss.on('close', () => {
        console.log('Frontend client disconnected');
      });

      wss.on('error', (err) => {
        console.log('Frontend Websocket error: ', err);
      });
    });
  }

  protected sendWebsocketData(data: PriceData): void {
    this.ws.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          const sendData = JSON.stringify(data);
          client.send(sendData);
        } catch (err) {
          console.error('Send data error: ', err);
        }
      }
    });
  }
}

class BybitPrice extends FrontEndWebsocket {
  private wsClient: WebsocketClient;
  constructor() {
    super();
    this.wsClient = new WebsocketClient({
      key: process.env.BYBITAPIKEY,
      secret: process.env.BYBITSECRET,
      market: 'v5',
    });
    this.initializeWebsocket();
    this.subscribePositions();
  }

  private initializeWebsocket(): void {
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

        this.sendWebsocketData(priceData);
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

    // const activePublicLinearTopics = this.wsClient
    //   .getWsStore()
    //   .getTopics(WS_KEY_MAP.v5LinearPublic);
    // console.log('Active public linear topic: ', activePublicLinearTopics);
  }

  private subscribePositions(): void {
    try {
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
