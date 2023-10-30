import WebSocket from 'ws';
import { TreeNewsMessage } from '../interface.js';
import { TickerAndSentiment } from '../interface.js';

function extractTreeNewsData(data: WebSocket.RawData): TreeNewsMessage {
  const messageString = data.toString('utf-8'),
    messageObj = JSON.parse(messageString);
  return messageObj;
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

export { extractTreeNewsData, extractString };
