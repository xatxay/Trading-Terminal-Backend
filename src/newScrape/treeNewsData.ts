import WebSocket from 'ws';
import { TreeNewsMessage } from '../interface.js';

function extractTreeNewsData(data: WebSocket.RawData): TreeNewsMessage {
  const messageString = data.toString('utf-8'),
    messageObj = JSON.parse(messageString);
  return messageObj;
}

export { extractTreeNewsData };
