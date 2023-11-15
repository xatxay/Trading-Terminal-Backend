import https from 'https';

export interface TreeNewsMessage {
  title: string;
  newsHeadline: string;
  url?: string;
  link: string;
  time: number;
  suggestions: string[];
  image?: string;
  video?: string;
  _id: string;
  source?: string;
  body?: string;
  tickerPercentage?: TickerPercentages[];
}

interface TickerPercentages {
  ticker: string;
  percentage: number;
}

export interface ExchangeParams {
  search?: string;
  page?: number;
  per_page?: number;
  catalogId?: number;
  pageNo?: number;
  pageSize?: number;
  httpsAgent?: https.Agent;
}

export interface ExchangeHeader {
  [key: string]: string;
  'accept-language'?: string;
}

export interface ExchangeConfig {
  params: ExchangeParams;
  headers?: ExchangeHeader;
  httpsAgent?: https.Agent;
}

export interface Proxy {
  host: string;
  port: string;
  username: string;
  password: string;
}

export interface UpbitData {
  list?: [
    {
      created_at: string;
      updated_at: string;
      id: number;
      title: string;
      view_count: number;
    },
  ];
}

export interface BinanceData {
  articles: [
    {
      id: number;
      code: string;
      title: string;
    },
  ];
}

export interface SecData {
  creator: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  isoDate: string;
}

export interface TickerAndSentiment {
  ticker: string;
  sentiment: number;
}

export interface AccountSummary {
  totalEquity: number;
  totalMarginBalance: number;
  totalAvailableBalance: number;
  totalPerpUPL: number;
}

export interface Wallet {
  getWalletBalance: () => Promise<AccountSummary>;
  getAllOpenPosition: () => Promise<unknown>;
}

export interface KlineData {
  start: number;
  end: number;
  interval: string;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  turnover: string;
  confirm: boolean;
  timestamp: number;
}

export interface Kline {
  topic: string;
  data: KlineData[];
  ts: number;
  type: string;
  wsKey: string;
}

export interface PriceData {
  ticker: string;
  percentage: number;
}

export interface BothData {
  news: TreeNewsMessage;
  price: PriceData[];
}
