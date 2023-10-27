import axios from 'axios';
import {
  ExchangeParams,
  ExchangeHeader,
  ExchangeConfig,
  UpbitData,
  BinanceData,
} from '../interface.js';

class Exchange<T> {
  protected url: string;
  protected params: ExchangeParams;
  protected config: ExchangeConfig;

  constructor(url: string, params: ExchangeParams) {
    this.url = url;
    this.params = params;
    this.config = {
      params: this.params,
    };
  }

  public getListing = async (): Promise<T> => {
    const response = await axios.get(this.url, this.config);
    return response.data.data;
  };
}

class Upbit extends Exchange<UpbitData> {
  constructor(url: string, params: ExchangeParams, header: ExchangeHeader) {
    super(url, params);
    this.config.headers = header;
  }
}

class Binance extends Exchange<BinanceData> {}

export { Upbit, Binance };
