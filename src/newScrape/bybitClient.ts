import { RestClientV5, WebsocketClient } from 'bybit-api';
import { BybitApiData, Decoded } from '../interface.js';
import { appEmit } from './utils.js';
import EventEmitter from 'events';
import { selectApiWithId } from '../login/userDatabase.js';

abstract class BybitClient extends EventEmitter {
  protected client: RestClientV5 | null = null;
  protected wsClient: WebsocketClient | null = null;

  constructor() {
    super();
    appEmit.on('bybitApi', (data: BybitApiData) => {
      if (data) {
        console.log('apiEmit: ', data);
        this.updateApi(data.apiKey, data.apiSecret);
      }
    });

    appEmit.on('userLogin', (data: BybitApiData) => {
      if (data) {
        console.log('userLoginEmit: ', data.apiKey, data.apiSecret);
        this.initLoginApiHandler(data.apiKey, data.apiSecret);
      }
    });

    appEmit.once('authRequest', async (data: Decoded) => {
      if (data) {
        const api = await selectApiWithId(data.userId);
        this.loadAppInit(api.apikey, api.apisecret);
      }
    });
  }

  private updateApi(apiKey: string, apiSecret: string): void {
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

    console.log('client: ', this.client);
    console.log('wsclient: ', this.wsClient);
  }

  private initLoginApiHandler(apiKey: string, apiSecret: string): void {
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
  }

  private loadAppInit(apiKey: string, apiSecret: string): void {
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
  }
}

export default BybitClient;
