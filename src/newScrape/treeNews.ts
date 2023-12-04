import dotenv from 'dotenv';
import WebSocket from 'ws';
import { extractNewsWsData } from './utils.js';
import EventEmitter from 'events';
// import BybitPriceData from './priceData.js';

dotenv.config();
export const appEmit = new EventEmitter();
// const bybitPercentage = new BybitPrice();

class TreeNews {
  private ws: WebSocket;
  // private bybitKline: BybitPriceData;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupEvents();
    // this.bybitKline.initializeWebsocket();
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
    const messageObj = extractNewsWsData(data);
    console.log('treenews message: ', messageObj);
    appEmit.emit('treeEmit', messageObj);
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
