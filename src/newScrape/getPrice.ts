import WebSocket from 'ws';
import { WebsocketClient, WS_KEY_MAP } from 'bybit-api';
import EventEmitter from 'events';
import { extractPriceData, subscribeKline, unSubscribeKline } from './utils.js';

class FrontEndWebsocket {
  private ws: WebSocket.Server;
  constructor() {
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

  public sendWebsocketData(data: string): void {
    this.ws.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (err) {
          console.error('Send data error: ', err);
        }
      }
    });
  }
}

class BybitPrice extends EventEmitter {
  private wsClient: WebsocketClient;
  constructor() {
    super();
    this.wsClient = new WebsocketClient({ market: 'v5' });
    this.initializeWebsocket();
  }

  private initializeWebsocket(): void {
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

    const activePublicLinearTopics = this.wsClient
      .getWsStore()
      .getTopics(WS_KEY_MAP.v5LinearPublic);
    console.log('Active public linear topic: ', activePublicLinearTopics);
  }

  public priceUpdate(): void {
    this.wsClient.on('update', (data) => {
      const priceData = extractPriceData(data);

      this.emit('percentage', priceData);
      console.log('Raw message received: ', priceData);
    });
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
