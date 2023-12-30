import { RestClientV5, WebsocketClient } from 'bybit-api';
import EventEmitter from 'events';

class BybitClient extends EventEmitter {
  public client: RestClientV5 | null = null;
  public wsClient: WebsocketClient | null = null;

  constructor() {
    super();
  }

  public updateApi(apiKey: string, apiSecret: string): void {
    if (!apiKey || !apiSecret) return;
    this.client = new RestClientV5({
      key: apiKey,
      secret: apiSecret,
      enable_time_sync: true,
    });
  }

  public updateWsApi(apiKey: string, apiSecret: string): void {
    if (!apiKey || !apiSecret) return;
    this.wsClient = new WebsocketClient({
      key: apiKey,
      secret: apiSecret,
      market: 'v5',
    });
  }

  public resetClient(): void {
    this.client = null;
    this.wsClient = null;
    console.log('resetting: ', this.client);
  }
}

export default BybitClient;
