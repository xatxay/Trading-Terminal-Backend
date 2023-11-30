import WebSocket from 'ws';
import { PriceData } from '../interface.js';

class FrontEndWebsocket {
  private ws: WebSocket.Server;
  constructor() {
    this.ws = new WebSocket.Server({ port: 8080 });
    this.startWebsocket();
  }

  private startWebsocket(): void {
    this.ws.on('connection', (wss) => {
      console.log('Frontend client connected: ');

      wss.on('close', () => {
        console.log('Frontend client disconnected: ');
      });

      wss.on('error', (err) => {
        console.log('Frontend Websocket error: ', err);
      });
    });
  }

  public sendWebsocketData(data: PriceData): void {
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
