import { RestClientV5, WebsocketClient } from 'bybit-api';
import EventEmitter from 'events';
// import { BybitApiData, Decoded } from '../interface.js';
// import { appEmit } from './utils.js';
// import { selectApiWithId } from '../login/userDatabase.js';

class BybitClient extends EventEmitter {
  private static instance: BybitClient;
  public client: RestClientV5 | null = null;
  protected wsClient: WebsocketClient | null = null;

  constructor() {
    super();
  }

  public static getInstance(): BybitClient {
    if (!BybitClient.instance) {
      BybitClient.instance = new BybitClient();
    }
    return BybitClient.instance;
  }

  public updateApi(apiKey: string, apiSecret: string): void {
    this.client = new RestClientV5({
      key: apiKey,
      secret: apiSecret,
      enable_time_sync: true,
    });

    // console.log('updated');
    // console.log('client: ', this.client);
    // console.log('wsclient: ', this.wsClient);
  }

  public updateWsApi(apiKey: string, apiSecret: string): void {
    this.wsClient = new WebsocketClient({
      key: apiKey,
      secret: apiSecret,
      market: 'v5',
    });
  }
}

export default BybitClient;
