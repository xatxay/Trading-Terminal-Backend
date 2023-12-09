import { chatgptClosePositionData } from './utils.js';
import { V5WsData } from '../interface.js';
import FrontEndWebsocket from './sendFrontEndData.js';
import BybitClient from './bybitClient.js';

class BybitPrice extends BybitClient {
  private wsInitialized: boolean = false;

  constructor() {
    super();
    // this.wsClient = new WebsocketClient({
    //   key: process.env.BYBITAPIKEY,
    //   secret: process.env.BYBITSECRET,
    //   market: 'v5',
    // });
    // this.initializeWebsocket();
    // this.subscribePositions();
  }

  public initializeWebsocket(): void {
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
      }
    });

    this.wsClient.on('open', () => {
      console.log('Position Websocket opened');
    });

    this.wsClient.on('reconnect', () => {
      console.log('Position Reconnecting...');
    });

    this.wsClient.on('reconnected', () => {
      console.log('Position Reconnected');
    });

    this.wsClient.on('error', () => {
      console.error('Error subscribing to position topic');
    });

    this.wsClient.on('response', (data) => {
      console.log('Log response: ', JSON.stringify(data, null, 2));
    });
    this.wsInitialized = true;
  }

  public isWsInitialized(): boolean {
    return this.wsInitialized;
  }

  public subscribePositions(): void {
    if (!this.wsClient) return;
    try {
      console.log('subscribing...', this.wsInitialized);
      this.wsClient.subscribeV5('position', 'linear');
      // this.checkSubscribeTopics();
    } catch (err) {
      console.error('Error subscribing to positions: ', err);
    }
  }
}

export { FrontEndWebsocket, BybitPrice };
