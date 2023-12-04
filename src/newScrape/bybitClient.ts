import { RestClientV5, WebsocketClient } from 'bybit-api';
import EventEmitter from 'events';
// import { BybitApiData, Decoded } from '../interface.js';
// import { appEmit } from './utils.js';
// import { selectApiWithId } from '../login/userDatabase.js';

class BybitClient extends EventEmitter {
  protected client: RestClientV5 | null = null;
  protected wsClient: WebsocketClient | null = null;
  constructor() {
    super();
  }

  public updateApi(apiKey: string, apiSecret: string): void {
    this.client = new RestClientV5({
      key: apiKey,
      secret: apiSecret,
      enable_time_sync: true,
    });

    this.wsClient = new WebsocketClient({
      key: apiKey,
      secret: apiSecret,
      market: 'v5',
    });
    console.log('updated');
    // console.log('client: ', this.client);
    // console.log('wsclient: ', this.wsClient);
  }
}

export default BybitClient;
