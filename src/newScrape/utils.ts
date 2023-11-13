import WebSocket from 'ws';
import { TreeNewsMessage } from '../interface.js';
import { TickerAndSentiment } from '../interface.js';
import TreeNews from './treeNews.js';
import { AccountInfo } from './routes.js';
import { Express } from 'express';
import { NewsWebsocket } from './routes.js';
// import { selectProxy } from '../proxy/manageDb.js';
// import ProxyManager from '../proxy/proxyManager.js';

function extractWsData(data: WebSocket.RawData): TreeNewsMessage {
  const messageString = data.toString('utf-8'),
    messageObj = JSON.parse(messageString);
  return messageObj;
}

function extractNewsWsData(data: WebSocket.RawData): TreeNewsMessage | null {
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
    newsData.title = blogTitle ? blogTitle[0].trim() : '';
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
}

const extractString = (response: string): TickerAndSentiment[] => {
  const responseSplit: string[] = response.split(';');
  return responseSplit.map((res) => {
    const [ticker, sentiment] = res.split('=').map((r) => r.trim());
    return {
      ticker,
      sentiment: Number(sentiment),
    };
  });
};

const treeWebsocket = (): TreeNews => {
  const treeNews = new TreeNews(process.env.TREENEWS);
  treeNews.startPing();
  return treeNews;
};

const sendAccountInfoRequest = (app: Express): void => {
  const sendAccountInfo = new AccountInfo(app);
  sendAccountInfo.getRequest('/accountSummary');
  sendAccountInfo.getRequest('/positions');
  sendAccountInfo.postRequest('/start');
  sendAccountInfo.postRequest('/stop');
  sendAccountInfo.postRequest('/closeAll');
  sendAccountInfo.postRequest('/close');
};

const sendTreeNewsRequest = (app: Express): void => {
  const treeNews = treeWebsocket();
  treeNews.on('news', (newsMessage: unknown) => {
    console.log('TREENEWS: ', newsMessage);
    const treeNewsWebsocket = new NewsWebsocket(app, newsMessage);
    treeNewsWebsocket.getNewsRequest();
  });
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

const closeButton = (): void => {
  console.log('close button clicked');
};
// const proxyManage = async (): Promise<string> => {
//   const allProxies = await selectProxy();
//   const proxy = new ProxyManager(allProxies);
//   const nextProxy = proxy.getNextProxy();
//   console.log('current proxy: ', nextProxy);
//   return nextProxy;
// };

export {
  extractWsData,
  extractString,
  treeWebsocket,
  sendAccountInfoRequest,
  sendTreeNewsRequest,
  extractNewsWsData,
  startButton,
  closeButton,
  stopButton,
  closeAllButton,
};
