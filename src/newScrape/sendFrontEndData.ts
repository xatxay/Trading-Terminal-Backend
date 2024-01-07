import WebSocket from 'ws';
import { PriceData, TerminalLog, V5WsData } from '../interface.js';

class FrontEndWebsocket {
  private ws: WebSocket.Server;

  constructor() {
    this.ws = new WebSocket.Server({ port: 8080 });
    // this.ws = wsServer;
    this.startPriceWebsocket();
  }

  private startPriceWebsocket(): void {
    this.ws.on('connection', (wss) => {
      console.log('Frontend client connected to price ws: ');

      wss.on('close', () => {
        console.log('Frontend client disconnected from price ws: ');
      });

      wss.on('error', (err) => {
        console.log('Frontend Price Websocket error: ', err);
      });
    });
  }

  public sendWebsocketData(data: PriceData | TerminalLog | V5WsData): void {
    this.ws.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          const sendData = JSON.stringify(data);
          client.send(sendData);
        } catch (err) {
          console.error('Send data error: ', err);
        }
      }
    });
  }
}

export default FrontEndWebsocket;
