export interface TreeNewsMessage {
  title: string;
  body: string;
  link: string;
  time: number;
  _id: string;
  source: string;
}

export interface ExchangeParams {
  search?: string;
  page?: number;
  per_page?: number;
  catalogId?: number;
  pageNo?: number;
  pageSize?: number;
}

export interface ExchangeHeader {
  [key: string]: string;
  'accept-language'?: string;
}

export interface ExchangeConfig {
  params: ExchangeParams;
  headers?: ExchangeHeader;
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