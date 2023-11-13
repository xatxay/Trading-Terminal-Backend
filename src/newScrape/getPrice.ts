import WebSocket from 'ws';
import { WebsocketClient, WS_KEY_MAP } from 'bybit-api';

abstract class FrontEndWebsocket {
  protected ws: WebSocket.Server;
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

  protected sendWebsocketData(data: string): void {
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

class BybitPrice extends FrontEndWebsocket {
  private wsClient: WebsocketClient;
  constructor() {
    super();
    this.wsClient = new WebsocketClient({ market: 'v5' });
  }

  public initializeWebsocket(): void {
    this.wsClient.on('update', (data) => {
      const rawData = JSON.stringify(data);

      this.sendWebsocketData(rawData);
      console.log('Raw message received: ', rawData);
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

    this.wsClient.subscribeV5('kline.1.BTCUSDT', 'linear');

    const activePublicLinearTopics = this.wsClient
      .getWsStore()
      .getTopics(WS_KEY_MAP.v5LinearPublic);
    console.log('Active public linear topic: ', activePublicLinearTopics);
  }
}

export default BybitPrice;
