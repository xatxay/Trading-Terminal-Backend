import dotenv from 'dotenv';
import WebSocket from 'ws';
import { extractTreeNewsData } from './treeNewsData.js';

dotenv.config();

class TreeNews {
  private ws: WebSocket;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupEvents();
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

  private onMessage(data: WebSocket.RawData): void {
    const messageObj = extractTreeNewsData(data);
    console.log('Tree News: ', messageObj);
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
// const initializedWebsocket = (): void => {
//   const ws = new WebSocket(treeNewsWs);

//   ws.on('open', () => {
//     console.log('Connected to Tree News');
//   });

//   ws.on('message', (data) => {
//     const messageObj = extractTreeNewsData(data);
//     console.log('Tree News: ', messageObj);
//   });

//   ws.on('error', (err: Error) => {
//     console.log('Error connecting to socket: ', err);
//   });

//   ws.on('close', (code, reason) => {
//     console.log(
//       `Websocklet close with code: ${code}. Reason: ${reason.toString()}`,
//     );
//     setTimeout(() => {
//       initializedWebsocket();
//     }, 1000);
//   });

//   setInterval(() => {
//     if (ws.readyState === WebSocket.OPEN) {
//       ws.ping();
//     }
//   }, 5000);
// };

// export default initializedWebsocket;
