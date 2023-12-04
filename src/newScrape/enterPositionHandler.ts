import WebSocket from 'ws';
import { appEmit } from './utils.js';
import {
  extractNewsWsData,
  extractString,
  formatNewsText,
  getTimeStamp,
  handleSubscribeList,
  submitNewsOrder,
} from './utils.js';
import {
  insertChatGptSentiment,
  insertNewsHeadline,
  insertTradeData,
} from '../tradeData/tradeAnalyzeUtils.js';
import { OpenAiAnalyze } from './chatgpt.js';
import { PriceData } from '../interface.js';
// import BybitTrading from './bybit.js';
import { BybitPrice } from './getPrice.js';
import { bybitAccount } from './routes.js';
// import BybitClient from './bybitClient.js';

const handleEnterPosition = async (): Promise<void> => {
  console.log('handle enter position');
  const bybitPercentage = new BybitPrice();
  const tickerSubscribe: string[] = [];
  const analyzer = new OpenAiAnalyze();
  appEmit.on('treeEmit', async (data: WebSocket.RawData) => {
    const messageObj = extractNewsWsData(data);

    if (messageObj.suggestions) {
      handleSubscribeList(bybitPercentage, messageObj, tickerSubscribe);
    }

    const wsTimeStamp = getTimeStamp(messageObj.time);

    const response = await analyzer.callOpenAi(
      messageObj.newsHeadline,
      messageObj.suggestions,
    );

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

    console.log('subscribeset: ', tickerSubscribe);
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
            // const bybitClient = BybitClient.getInstance();
            const coinData = await bybitAccount.getSpecificPosition(
              tickerAndSentiment.ticker,
            );
            if (+data.price >= +coinData.entryPrice * 5) {
              await bybitAccount.closeOrder(side, coinData.size);
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
  });
};

export default handleEnterPosition;
