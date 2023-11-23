import dotenv from 'dotenv';
import WebSocket from 'ws';
import {
  extractNewsWsData,
  extractString,
  formatNewsText,
  getTimeStamp,
  handleSubscribeList,
  submitNewsOrder,
} from './utils.js';
import { BybitPrice } from './getPrice.js';
import {
  insertChatGptSentiment,
  insertNewsHeadline,
  insertTradeData,
} from '../tradeData/tradeAnalyzeUtils.js';
import OpenAiAnalyze from './chatgpt.js';
import { PriceData } from '../interface.js';
import BybitTrading from './bybit.js';

dotenv.config();
const bybitPercentage = new BybitPrice();

class TreeNews {
  private ws: WebSocket;
  private tickerSubscribe: string[];

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupEvents();
    this.tickerSubscribe = [];
  }

  private setupEvents(): void {
    this.ws.on('open', this.onOpen.bind(this));
    this.ws.on('message', this.onMessage.bind(this));
    this.ws.on('error', this.onError.bind(this));
    this.ws.on('close', this.onClose.bind(this));
  }

  private onOpen(): void {
    console.log('Connected to Tree News');
  }

  private async onMessage(data: WebSocket.RawData): Promise<void> {
    const apiKey = process.env.OPENAI_API_KEY;
    const messageObj = extractNewsWsData(data);

    if (messageObj.suggestions) {
      handleSubscribeList(bybitPercentage, messageObj, this.tickerSubscribe);
    }

    const wsTimeStamp = getTimeStamp(messageObj.time);

    const analyzer = new OpenAiAnalyze(apiKey, messageObj.newsHeadline);
    const response = await analyzer.callOpenAi(messageObj.suggestions);

    const formattedNewsHeadline = formatNewsText(messageObj.newsHeadline);

    await insertNewsHeadline(
      messageObj._id,
      messageObj.title,
      formattedNewsHeadline,
      messageObj.url,
      messageObj.link,
      wsTimeStamp,
      messageObj.suggestions,
      messageObj.body,
    );

    console.log('subscribeset: ', this.tickerSubscribe);
    console.log('newswsdata: ', messageObj);

    if (response) {
      const result = extractString(response);
      console.log('gpt result: ', result);
      const gptTimeStamp = getTimeStamp();
      for (const tickerAndSentiment of result) {
        const side =
          tickerAndSentiment.sentiment >= 70
            ? 'Buy'
            : tickerAndSentiment.sentiment <= 70
            ? 'Sell'
            : '';
        bybitPercentage.once('percentage', async (data: PriceData) => {
          if (
            (tickerAndSentiment.ticker === data.ticker &&
              tickerAndSentiment.sentiment >= 70 &&
              data.percentage < 2) ||
            (tickerAndSentiment.ticker === data.ticker &&
              tickerAndSentiment.sentiment <= 70 &&
              data.percentage < 2)
          ) {
            console.log('submitting...________________');
            const response = await submitNewsOrder(
              tickerAndSentiment.ticker,
              side,
              0.001,
              true,
            );
            const getEntryPrice = new BybitTrading(tickerAndSentiment.ticker);
            const coinData = await getEntryPrice.getSpecificPosition();
            if (+data.price >= +coinData.entryPrice * 5) {
              await getEntryPrice.closeOrder(side, coinData.size);
            }
            await insertTradeData(
              messageObj._id,
              response.time,
              tickerAndSentiment.ticker,
              side,
              '-',
              '-',
              '-',
              '-',
            );
          }
        });
        await insertChatGptSentiment(
          messageObj._id,
          gptTimeStamp,
          tickerAndSentiment.ticker,
          tickerAndSentiment.sentiment,
        );
      }
    }
    console.log('Chatgpt response: ', response);
  }

  private onError(err: Error): void {
    console.log('Error connecting to socket: ', err);
  }

  private onClose(code: number, reason: string): void {
    console.log(`Websocket close with code : ${code}. Reason: ${reason}`);
    setTimeout(() => {
      new TreeNews(process.env.TREENEWS);
    }, 1000);
  }

  public startPing(): void {
    setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 5000);
  }
}

export default TreeNews;
