import axios from 'axios';
import {
  ExchangeParams,
  ExchangeHeader,
  ExchangeConfig,
  UpbitData,
  BinanceData,
  Proxy,
} from '../interface.js';
import ProxyManager from '../proxy/proxyManager.js';
// import { HttpsProxyAgent } from 'https-proxy-agent';

abstract class Exchange<T> {
  protected url: string;
  protected params: ExchangeParams;
  protected config: ExchangeConfig;
  protected proxies: ProxyManager;

  constructor(url: string, params: ExchangeParams, allProxies: Proxy[]) {
    this.url = url;
    this.params = params;
    this.proxies = new ProxyManager(allProxies);
    this.config = {
      params: this.params,
    };
  }

  public getListing = async (): Promise<T | null> => {
    try {
      const currentProxies = this.proxies.getNextProxy();
      console.log('CURRENT PROXIES: ', currentProxies);
      // const httpsAgent = new HttpsProxyAgent(
      //   `http://${currentProxies.username}:${currentProxies.password}@${currentProxies.host}:${currentProxies.port}`,
      // );
      // this.config.httpsAgent = httpsAgent;
      const response = await axios.get(this.url, this.config);
      this.proxies.getNextProxy();
      return response.data.data;
    } catch (err) {
      console.error('Error getting listing: ', err.response);
      console.error('Error getting listing message : ', err.message);
      return null;
    }
  };
}

class Upbit extends Exchange<UpbitData> {
  constructor(
    url: string,
    params: ExchangeParams,
    header: ExchangeHeader,
    allProxies: Proxy[],
  ) {
    super(url, params, allProxies);
    this.config.headers = header;
  }

  public getTicker = (listing: string, regex: RegExp): string | null => {
    const checkMatching = listing.match(regex);
    return checkMatching ? checkMatching[1] : null;
  };
}

class Binance extends Exchange<BinanceData> {}

export { Upbit, Binance };
