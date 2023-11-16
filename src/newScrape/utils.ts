import WebSocket from 'ws';
import { Kline, PriceData, TreeNewsMessage } from '../interface.js';
import { TickerAndSentiment } from '../interface.js';
import { AccountInfo } from './routes.js';
import { Express } from 'express';
import BybitTrading from './bybit.js';
import { WebsocketClient, WS_KEY_MAP } from 'bybit-api';
// import { selectProxy } from '../proxy/manageDb.js';
// import ProxyManager from '../proxy/proxyManager.js';

function extractNewsWsData(data: WebSocket.RawData): TreeNewsMessage | null {
  try {
    if (!data) return null;
    const messageString = data.toString('utf-8');
    const parseData = JSON.parse(messageString);

    const newsData: TreeNewsMessage = {
      title: '',
      newsHeadline: '',
      suggestions: [],
      url: '',
      link: '',
      image: '',
      video: '',
      time: 0,
      _id: '',
    };

    if (parseData.source) {
      const blogTitle = parseData.title.match(/^([A-Z\s\\.\\-]+:)/) || [];
      newsData.title = blogTitle[0] ? blogTitle[0].trim() : '';
      newsData.newsHeadline = newsData.title
        ? parseData.title.substring(newsData.title.length).trim()
        : parseData.title;
      newsData.url = parseData.url;
    } else {
      const twitterTitle = parseData.title
        ? parseData.title.match(/@([A-Za-z0-9_]+)/)
        : '';
      newsData.title = twitterTitle[1];
      newsData.newsHeadline = parseData.body;
      newsData.link = parseData.link;
    }
    newsData.image = parseData.image ? parseData.image : '';
    newsData.video = parseData.video ? parseData.video : '';
    newsData.suggestions = parseData.suggestions
      ? parseData.suggestions.map((coin: { coin: string }) => coin.coin)
      : [];
    newsData.time = parseData.time;
    newsData._id = parseData._id;

    return newsData;
  } catch (err) {
    console.error('Error extracting news ws data: ', err);
    return null;
  }
}

const extractString = (response: string): TickerAndSentiment[] => {
  try {
    const responseSplit: string[] = response.split(';');
    return responseSplit.map((res) => {
      const [ticker, sentiment] = res.split('=').map((r) => r.trim());
      return {
        ticker,
        sentiment: Number(sentiment),
      };
    });
  } catch (err) {
    console.log('Error extracting ticker and sentiment: ', err);
    throw err;
  }
};

// const treeWebsocket = (): TreeNews => {
//   try {
//     const treeNews = new TreeNews(process.env.TREENEWS);
//     treeNews.startPing();
//     return treeNews;
//   } catch (err) {
//     console.log('Error initialize tree news ws: ', err);
//     throw err;
//   }
// };

const sendAccountInfoRequest = (app: Express): void => {
  try {
    const sendAccountInfo = new AccountInfo(app);
    sendAccountInfo.getRequest('/accountSummary');
    sendAccountInfo.getRequest('/positions');
    sendAccountInfo.postRequest('/start');
    sendAccountInfo.postRequest('/stop');
    sendAccountInfo.postRequest('/closeAll');
    sendAccountInfo.postRequest('/close');
    sendAccountInfo.postRequest('/75');
    sendAccountInfo.postRequest('/25');
  } catch (err) {
    console.error('Error sending requests: ', err);
  }
};

const startButton = (): void => {
  console.log('started button clicked');
};

const stopButton = (): void => {
  console.log('stop button clicked');
};

const closeAllButton = (): void => {
  console.log('close all button clicked');
};

const closeButton = async (symbol: string, side: string): Promise<void> => {
  try {
    const bybitOrder = new BybitTrading(symbol);
    await bybitOrder.closeOrder(side);
    console.log('close button clicked');
  } catch (err) {
    console.error('Error closing button: ', err);
  }
};

const seventyFive = async (symbol: string, side: string): Promise<void> => {
  try {
    const bybitSubmit = new BybitTrading(symbol);
    await bybitSubmit.submitOrder(side);
  } catch (err) {
    console.log('Error submitting 75% orders: ', err);
  }
};

const subscribeKline = async (
  wsClient: WebsocketClient,
  ticker: string,
): Promise<void> => {
  try {
    const instrument = new BybitTrading('');
    const response = await instrument.getInstrumentInfo(ticker);
    const klineTicker = `kline.1.${ticker}USDT`;
    const activePublicLinearTopics = wsClient
      .getWsStore()
      .getTopics(WS_KEY_MAP.v5LinearPublic);
    if (response === 0 && !activePublicLinearTopics.has(klineTicker)) {
      wsClient.subscribeV5(`kline.1.${ticker}USDT`, 'linear');
    }

    console.log('Active public linear topic: ', activePublicLinearTopics);
  } catch (err) {
    console.error('Error subscribing to linear topic: ', err);
  }
};

const unSubscribeKline = (wsClient: WebsocketClient, ticker: string): void => {
  try {
    wsClient.unsubscribeV5(`kline.1.${ticker}`, 'linear');
  } catch (err) {
    console.error('Error unsubscribing to linear topic: ', err);
  }
};

const calculatePercentage = (data: Kline): number => {
  try {
    // const dataParse: Kline = JSON.parse(data);
    const { open, close } = data.data[0];
    const openPrice = Number(open);
    const closePrice = Number(close);
    const percentage = ((closePrice - openPrice) / openPrice) * 100;
    return +percentage.toFixed(2);
  } catch (err) {
    console.log('Error calculating percentage: ', err);
    throw err;
  }
};

const extractPriceData = (data: Kline): PriceData => {
  try {
    const priceData = {
      ticker: '',
      percentage: 0,
    };
    const tickerMatch = data.topic.match(/\.([A-Z]+)USDT/);
    if (tickerMatch) {
      priceData.ticker = tickerMatch[1];
    } else {
      console.log('No ticker found');
    }

    priceData.percentage = calculatePercentage(data);
    return priceData;
  } catch (err) {
    console.log('Error extracting price data');
    throw err;
  }
};
// const proxyManage = async (): Promise<string> => {
//   const allProxies = await selectProxy();
//   const proxy = new ProxyManager(allProxies);
//   const nextProxy = proxy.getNextProxy();
//   console.log('current proxy: ', nextProxy);
//   return nextProxy;
// };

export {
  extractString,
  sendAccountInfoRequest,
  extractNewsWsData,
  startButton,
  closeButton,
  stopButton,
  closeAllButton,
  subscribeKline,
  unSubscribeKline,
  calculatePercentage,
  extractPriceData,
  seventyFive,
};
