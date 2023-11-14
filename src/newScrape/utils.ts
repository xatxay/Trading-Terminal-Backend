import WebSocket from 'ws';
import { Kline, TreeNewsMessage } from '../interface.js';
import { TickerAndSentiment } from '../interface.js';
import TreeNews from './treeNews.js';
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
      console.log('blogtitle: ', blogTitle);
      newsData.title = blogTitle[0] ? blogTitle[0].trim() : '';
      console.log('BLOGTITLE: ', blogTitle);
      newsData.newsHeadline = newsData.title
        ? parseData.title.substring(newsData.title.length).trim()
        : parseData.title;
      newsData.url = parseData.url;
    } else {
      const twitterTitle = parseData.title
        ? parseData.title.match(/@([A-Za-z0-9_]+)/)
        : '';
      newsData.title = twitterTitle[1];
      console.log('TWITTERTITLE: ', newsData.title);
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

const treeWebsocket = (): TreeNews => {
  try {
    const treeNews = new TreeNews(process.env.TREENEWS);
    treeNews.startPing();
    return treeNews;
  } catch (err) {
    console.log('Error initialize tree news ws: ', err);
    throw err;
  }
};

const sendAccountInfoRequest = (app: Express): void => {
  try {
    const sendAccountInfo = new AccountInfo(app);
    sendAccountInfo.getRequest('/accountSummary');
    sendAccountInfo.getRequest('/positions');
    sendAccountInfo.postRequest('/start');
    sendAccountInfo.postRequest('/stop');
    sendAccountInfo.postRequest('/closeAll');
    sendAccountInfo.postRequest('/close');
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

const closeButton = (symbol: string, side: string): void => {
  try {
    const bybitOrder = new BybitTrading(symbol);
    bybitOrder.closeOrder(side);
    console.log('close button clicked');
  } catch (err) {
    console.error('Error closing button: ', err);
  }
};

const subscribeKline = (wsClient: WebsocketClient, ticker: string): void => {
  try {
    wsClient.subscribeV5(`kline.1.${ticker}USDT`, 'linear');

    const activePublicLinearTopics = wsClient
      .getWsStore()
      .getTopics(WS_KEY_MAP.v5LinearPublic);
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

const calculatePercentage = (data: string): number => {
  try {
    const dataParse: Kline = JSON.parse(data);
    const { open, close } = dataParse.data[0];
    const openPrice = Number(open);
    const closePrice = Number(close);
    const percentage = ((closePrice - openPrice) / openPrice) * 100;

    console.log('open: ', open, 'close: ', close, 'percentage: ', percentage);
    return +percentage.toFixed(2);
  } catch (err) {
    console.log('Error calculating percentage: ', err);
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
  treeWebsocket,
  sendAccountInfoRequest,
  extractNewsWsData,
  startButton,
  closeButton,
  stopButton,
  closeAllButton,
  subscribeKline,
  unSubscribeKline,
  calculatePercentage,
};
