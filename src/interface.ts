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

export interface PositionData extends KlineData {
  positionIdx: number;
  tradeMode: number;
  riskId: number;
  riskLimitValue: string;
  symbol: string;
  side: string;
  size: string;
  entryPrice: string;
  leverage: string;
  positionValue: string;
  positionBalance: string;
  markPrice: string;
  positionIM: string;
  positionMM: string;
  takeProfit: string;
  stopLoss: string;
  trailingStop: string;
  unrealisedPnl: string;
  cumRealisedPnl: string;
  createdTime: string;
  updatedTime: string;
  tpslMode: string;
  liqPrice: string;
  bustPrice: string;
  category: string;
  positionStatus: string;
  adlRankIndicator: number;
  autoAddMargin: number;
  leverageSysUpdatedTime: string;
  mmrSysUpdatedTime: string;
  seq: number;
  isReduceOnly: false;
}

export type Data = PositionData | KlineData;

export interface V5WsData {
  topic: string;
  data: PositionData[];
  ts: number;
  type: string;
  wsKey: string;
}

export interface PriceData {
  ticker: string;
  percentage: number;
  price: string;
}

export interface TerminalLog {
  type: string;
  message: string;
  timeStamp: string;
}

export interface BothData {
  news: TreeNewsMessage;
  price: PriceData[];
}

export interface OpenOrder {
  avgPrice: string;
}

export interface UserLogin {
  id: number;
  email: string;
  password: string;
}

export interface ResponseBybit {
  retCode: number;
  retMsg: string;
  result?: Record<string, never> | Result | TradeResult;
  retExtInfo?: Record<string, never>;
  time?: number;
}

export interface TradeResult {
  symbol?: string;
  orderType?: string;
  leverage?: string;
  updatedTime?: string;
  side?: string;
  orderId?: string;
  closedPnl?: string;
  avgEntryPrice?: string;
  qty?: string;
  cumEntryValue?: string;
  createdTime?: string;
  orderPrice?: string;
  closedSize?: string;
  avgExitPrice?: string;
  execType?: string;
  fillCount?: string;
  cumExitValue?: string;
}

export interface SubmitOrder {
  retCode: number;
  retMsg: string;
  result: Result;
  retExtInfo?: Record<string, never>;
  time: number;
}

interface Result {
  orderId: string;
  orderLinkId: string;
}

export interface SpecificCoin {
  entryPrice: string;
  size: string;
}

export interface CheckApiData extends UserLogin {
  apikey: string;
  apisecret: string;
}

export interface CheckOpenAi {
  openai: string;
}

export interface BybitApiData {
  email?: string;
  apiKey: string;
  apiSecret: string;
}

export interface Decoded {
  userId: number;
  iat: number;
  exp: number;
}

export type Signature = {
  apiKey: string;
  apiSecret: string;
  timeStamp?: string;
  recvWindow?: string;
};
