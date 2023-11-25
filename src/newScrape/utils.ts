import WebSocket from 'ws';
import {
  V5WsData,
  PriceData,
  ResponseBybit,
  TreeNewsMessage,
  SubmitOrder,
} from '../interface.js';
import { TickerAndSentiment } from '../interface.js';
// import { AccountInfo } from './routes.js';
// import { Express } from 'express';
import BybitTrading from './bybit.js';
import { WebsocketClient, WS_KEY_MAP } from 'bybit-api';
import { BybitPrice } from './getPrice.js';
import { updateTradeOutcome } from '../tradeData/tradeAnalyzeUtils.js';
// import { selectUser } from '../login/createUser.js';
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

const handleSubscribeList = (
  bybitPercentage: BybitPrice,
  messageObj: TreeNewsMessage,
  tickerSubscribe: string[],
): void => {
  for (const coin of messageObj.suggestions) {
    bybitPercentage.subscribeV5(coin);
    const existingIndex = tickerSubscribe.indexOf(coin);
    if (existingIndex !== -1) {
      tickerSubscribe.splice(existingIndex, 1);
    }
    tickerSubscribe.unshift(coin);
    if (tickerSubscribe.length > 15) {
      const removedCoin = tickerSubscribe.pop();
      removedCoin && bybitPercentage.unsubscribeV5(coin);
    }
  }
};

const formatNewsText = (newsText: string): string => {
  try {
    const maxLength = 255;
    const removeEmoji =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}]|[^\w\s]|[\r\n]+/gu;
    let formattedText = newsText.replace(removeEmoji, '').trim();

    if (formattedText.length > maxLength) {
      formattedText = formattedText.substring(0, maxLength);
      const lastSpaceIndex = formattedText.lastIndexOf(' ');
      if (lastSpaceIndex > 0) {
        formattedText = formattedText.substring(0, lastSpaceIndex);
      }
      formattedText += '...';
    }
    return formattedText;
  } catch (err) {
    console.log('Failed formatting news text: ', err);
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

// const sendAccountInfoRequest = (app: Express): void => {
//   // TODO: refactor this to use express ROUTERS (done)
//   try {
//     const sendAccountInfo = new AccountInfo(app);
//     sendAccountInfo.getRequest('/accountSummary');
//     sendAccountInfo.getRequest('/positions');
//     sendAccountInfo.postRequest('/start');
//     sendAccountInfo.postRequest('/stop');
//     sendAccountInfo.postRequest('/closeAll');
//     sendAccountInfo.postRequest('/close');
//     sendAccountInfo.postRequest('/submitOrder');
//     sendAccountInfo.postRequest('/login');
//     sendAccountInfo.postRequest('/logout');
//   } catch (err) {
//     console.error('Error sending requests: ', err);
//   }
// };

const startButton = (): void => {
  console.log('started button clicked');
};

const stopButton = (): void => {
  console.log('stop button clicked');
};

const closeAllButton = (): void => {
  console.log('close all button clicked');
};

const closeButton = async (
  symbol: string,
  side: string,
): Promise<ResponseBybit> => {
  try {
    const bybitOrder = new BybitTrading(symbol);
    const response = await bybitOrder.closeOrder(side);
    console.log('close button clicked');
    return response;
  } catch (err) {
    console.error('Error closing button: ', err);
    throw err;
  }
};

const chatgptClosePositionData = async (
  symbol: string,
  time: number,
): Promise<void> => {
  try {
    console.log('casdasd: ', symbol, '|', time);
    const bybitOrder = new BybitTrading(symbol);
    const response = await bybitOrder.getTradeResult(time);
    const tradeResult = {
      symbol: response.result.list[0].symbol,
      entryPrice: response.result.list[0].avgEntryPrice,
      exitPrice: response.result.list[0].avgExitPrice,
      pnl: response.result.list[0].closedPnl,
      timeStamp: response.result.list[0].createdTime,
      side: response.result.list[0].side,
    };
    const isPartial = checkPartials(
      tradeResult.side,
      tradeResult.entryPrice,
      tradeResult.exitPrice,
    );
    const partials = isPartial === true ? 'yes' : 'no';
    const outcome = Number(tradeResult.pnl) < 0 ? 'win' : 'loss';
    const side = tradeResult.side === 'Buy' ? 'Sell' : 'Buy';
    updateTradeOutcome(
      tradeResult.entryPrice,
      partials,
      tradeResult.pnl,
      outcome,
      tradeResult.timeStamp,
      tradeResult.symbol,
      side,
    );
  } catch (err) {
    console.log('Failed getting chatgpt close position result: ', err);
  }
};

const submitNewsOrder = async (
  symbol: string,
  side: string,
  percentage: number,
  chatgpt?: boolean,
): Promise<SubmitOrder> => {
  try {
    if (symbol === 'N/A') return null;
    console.log('75: ', symbol, side, percentage);
    const bybitSubmit = new BybitTrading(symbol);
    const response = await bybitSubmit.submitOrder(side, 0.001, chatgpt);
    return response;
  } catch (err) {
    console.log('Error submitting news orders: ', err);
    throw err;
  }
};

const subscribeKline = async (
  wsClient: WebsocketClient,
  ticker: string,
): Promise<void> => {
  try {
    const instrument = new BybitTrading('');
    const response = await instrument.getInstrumentInfo(`${ticker}USDT`);
    const klineTicker = `kline.3.${ticker}USDT`;
    const activePublicLinearTopics = wsClient
      .getWsStore()
      .getTopics(WS_KEY_MAP.v5LinearPublic);
    if (response === 0 && !activePublicLinearTopics.has(klineTicker)) {
      wsClient.subscribeV5(`kline.3.${ticker}USDT`, 'linear');
    }

    console.log('Active public linear topic: ', activePublicLinearTopics);
  } catch (err) {
    console.error('Error subscribing to linear topic: ', err);
  }
};

const unSubscribeKline = (wsClient: WebsocketClient, ticker: string): void => {
  try {
    wsClient.unsubscribeV5(`kline.3.${ticker}`, 'linear');
  } catch (err) {
    console.error('Error unsubscribing to linear topic: ', err);
  }
};

// const isPositionData = (data: Data): data is PositionData => {
//   return (data as PositionData).side !== undefined;
// };

// const isKlineData = (data: Data): data is KlineData => {
//   return (
//     (data as KlineData).open !== undefined &&
//     (data as KlineData).close !== undefined
//   );
// };

const calculatePercentage = (data: V5WsData): number => {
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

const extractPriceData = (data: V5WsData): PriceData => {
  try {
    const priceData = {
      ticker: '',
      percentage: 0,
      price: '',
    };
    const tickerMatch = data.topic.match(/\.([A-Z]+)USDT/);
    if (tickerMatch) {
      priceData.ticker = tickerMatch[1];
    } else {
      console.log('No ticker found');
    }

    priceData.percentage = calculatePercentage(data);
    priceData.price = data.data[0].close; //check front end
    return priceData;
  } catch (err) {
    console.log('Error extracting price data');
    throw err;
  }
};

const getTimeStamp = (newsTime?: number): string => {
  const now = newsTime ? new Date(newsTime) : new Date();
  const time = {
    date: now.getDate().toString().padStart(2, '0'),
    month: now.getMonth().toString().padStart(2, '0'),
    year: now.getFullYear().toString().slice(-2),
    hour: now.getHours().toString().padStart(2, '0'),
    minute: now.getMinutes().toString().padStart(2, '0'),
    second: now.getSeconds().toString().padStart(2, '0'),
    milliseconds: now.getMilliseconds().toString().padStart(3, '0'),
  };
  const timeStamp = `${time.date}/${time.month}/${time.year}, ${time.hour}:${time.minute}:${time.second}:${time.milliseconds}`;
  console.log('timeStamp: ', timeStamp);
  return timeStamp;
};

const checkPartials = (
  side: string,
  entryPrice: string,
  exitPrice: string,
): boolean => {
  try {
    let isPartial = false;
    const numEntryPrice = Number(entryPrice);
    const numExitPrice = Number(exitPrice);
    if (side === 'Sell' && numExitPrice < numEntryPrice * 0.1 + numEntryPrice) {
      isPartial = true;
      return isPartial;
    } else if (
      side === 'Buy' &&
      numExitPrice > numEntryPrice - numEntryPrice * 0.1
    ) {
      return isPartial;
    }
    return isPartial;
  } catch (err) {
    throw new Error('Error checking partials: ', err);
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
  // sendAccountInfoRequest,
  extractNewsWsData,
  startButton,
  closeButton,
  stopButton,
  closeAllButton,
  subscribeKline,
  unSubscribeKline,
  calculatePercentage,
  extractPriceData,
  submitNewsOrder,
  handleSubscribeList,
  getTimeStamp,
  chatgptClosePositionData,
  checkPartials,
  formatNewsText,
  // isPositionData,
};
