import dotenv from 'dotenv';
import WebSocket from 'ws';
import { extractTreeNewsData } from './treeNewsData.js';

dotenv.config();

const treeNewsWs = process.env.TREENEWS;

const initializedWebsocket = (): void => {
  const ws = new WebSocket(treeNewsWs);

  ws.on('open', () => {
    console.log('Connected to Tree News');
  });

  ws.on('message', (data) => {
    const messageObj = extractTreeNewsData(data);
    console.log('Tree News: ', messageObj);
  });

  ws.on('error', (err: Error) => {
    console.log('Error connecting to socket: ', err);
  });

  ws.on('close', (code, reason) => {
    console.log(
      `Websocklet close with code: ${code}. Reason: ${reason.toString()}`,
    );
    setTimeout(() => {
      initializedWebsocket();
    }, 1000);
  });

  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 5000);
};

export default initializedWebsocket;
