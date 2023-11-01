import axios from 'axios';
import {
  ExchangeParams,
  ExchangeHeader,
  ExchangeConfig,
  UpbitData,
  BinanceData,
} from '../interface.js';
// import ProxyManager from '../proxy/proxyManager.js';

abstract class Exchange<T> {
  protected url: string;
  protected params: ExchangeParams;
  protected config: ExchangeConfig;
  // protected proxies: ProxyManager;

  constructor(url: string, params: ExchangeParams) {
    this.url = url;
    this.params = params;
    // this.proxies = new ProxyManager(allProxies);
    this.config = {
      params: this.params,
    };
  }

  public getListing = async (): Promise<T | null> => {
    try {
      // const currentProxies = this.proxies.getNextProxy();
      // console.log('CURRENT PROXIES: ', currentProxies);
      // this.config.proxy = {
      //   protocol: 'https',
      //   host: currentProxies.split(':')[0],
      //   port: parseInt(currentProxies.split(':')[1]),
      //   auth: {
      //     username: currentProxies.split(':')[2],
      //     password: currentProxies.split(':')[3],
      //   },
      // };
      console.log('this.url: ', this.url);
      // console.log('Sending request with proxy: ', this.config.proxy);
      const response = await axios.get(this.url, this.config);
      // this.proxies.getNextProxy();
      return response.data.data;
    } catch (err) {
      console.error('Error getting listing: ', err);
      return null;
    }
  };
}

class Upbit extends Exchange<UpbitData> {
  constructor(
    url: string,
    params: ExchangeParams,
    header: ExchangeHeader,
    // allProxies: string[],
  ) {
    super(url, params);
    this.config.headers = header;
  }

  public getTicker = (listing: string, regex: RegExp): string | null => {
    const checkMatching = listing.match(regex);
    console.log('type: ', typeof regex);
    return checkMatching ? checkMatching[1] : null;
  };
}

class Binance extends Exchange<BinanceData> {}

export { Upbit, Binance };
