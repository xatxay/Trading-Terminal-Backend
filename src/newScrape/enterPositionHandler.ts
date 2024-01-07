import { sendLogMessage } from './utils.js';
import {
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
import { PriceData, TreeNewsMessage } from '../interface.js';
import {
  bybitAccount,
  bybitWsClient,
  klineWs,
  openAiClass,
} from './classInstance.js';
import TreeNews from './treeNews.js';
import { appEmit } from './treeNews.js';
import { dataFrontEnd } from './server.js';
// import { dataFrontEnd } from './classInstance.js';

const treeNews = new TreeNews(process.env.TREENEWS);
treeNews.startPing();
const tickerSubscribe: string[] = [];
let startChatgpt = false;

appEmit.on('treeEmit', async (messageObj: TreeNewsMessage) => {
  console.log('treeemit: ', messageObj);
  console.log('current mode: ', startChatgpt);
  if (messageObj.suggestions) {
    handleSubscribeList(klineWs, messageObj, tickerSubscribe);
  }
  if (!startChatgpt) return;

  const wsTimeStamp = getTimeStamp(messageObj.time);

  const chatGptResponse = await openAiClass.callOpenAi(messageObj.newsHeadline);

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

  if (chatGptResponse) {
    const logMessage = {
      gptTextResponse: `Chatgpt response: ${chatGptResponse}`,
      submitting: `Submitting...`,
      orderSubmitted: '',
      closePartial: '',
    };
    const gptLogResponse = sendLogMessage(logMessage.gptTextResponse);
    dataFrontEnd.sendWebsocketData(gptLogResponse);
    const result = extractString(chatGptResponse);
    console.log('gpt result: ', result);
    const gptTimeStamp = getTimeStamp();
    for (const tickerAndSentiment of result) {
      const side =
        tickerAndSentiment.sentiment >= 70
          ? 'Buy'
          : tickerAndSentiment.sentiment <= 70
          ? 'Sell'
          : '';
      bybitWsClient.once('percentage', async (data: PriceData) => {
        if (
          (tickerAndSentiment.ticker === data.ticker &&
            tickerAndSentiment.sentiment >= 70 &&
            data.percentage < 2) ||
          (tickerAndSentiment.ticker === data.ticker &&
            tickerAndSentiment.sentiment <= 70 &&
            data.percentage < 2)
        ) {
          console.log(logMessage.submitting);
          const submitting = sendLogMessage(logMessage.submitting);
          dataFrontEnd.sendWebsocketData(submitting);
          const submitOrderResponse = await submitNewsOrder(
            tickerAndSentiment.ticker,
            side,
            0.001,
            true,
          );
          if (submitOrderResponse) {
            logMessage.orderSubmitted = `Order Submitted: ${submitOrderResponse}`;
            console.log(logMessage.orderSubmitted);
            const orderSubmitted = sendLogMessage(logMessage.orderSubmitted);
            dataFrontEnd.sendWebsocketData(orderSubmitted);
          }
          // const bybitClient = BybitClient.getInstance();
          const coinData = await bybitAccount.getSpecificPosition(
            tickerAndSentiment.ticker,
          );
          if (+data.price >= +coinData.entryPrice * 5) {
            const closeOrderResponse = await bybitAccount.closeOrder(
              side,
              coinData.size,
            );
            logMessage.closePartial = `Closed half: ${closeOrderResponse}`;
            console.log(logMessage.closePartial);
            const closePartialLog = sendLogMessage(logMessage.closePartial);
            dataFrontEnd.sendWebsocketData(closePartialLog);
          }
          await insertTradeData(
            messageObj._id,
            submitOrderResponse.time,
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
  console.log('Chatgpt response: ', chatGptResponse);
});

const startChatgptMode = (): void => {
  startChatgpt = true;
  console.log('start chatgpt mode: ', startChatgpt);
};

const stopChatgptMode = (): void => {
  startChatgpt = false;
  console.log('stop chatgpt mode: ', startChatgpt);
};
export { startChatgptMode, stopChatgptMode };
