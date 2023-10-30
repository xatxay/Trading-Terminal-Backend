import dotenv from 'dotenv';
import WebSocket from 'ws';
import { extractTreeNewsData } from './utils.js';
// import OpenAiAnalyze from './chatgpt.js';

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

  private async onMessage(data: WebSocket.RawData): Promise<void> {
    let newsHeadline: string;
    // const apiKey = process.env.OPENAI_API_KEY;
    const messageObj = extractTreeNewsData(data);
    if (messageObj.source) {
      newsHeadline = messageObj.title;
    } else {
      newsHeadline = messageObj.body;
    }
    console.log('Tree News: ', newsHeadline);
    // const analyzer = new OpenAiAnalyze(apiKey, newsHeadline);
    // const response = await analyzer.callOpenAi();
    // console.log('Chatgpt response: ', response);
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
