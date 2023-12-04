// import { WebsocketClient } from 'bybit-api';
// import EventEmitter from 'events';
// import { V5WsData } from '../interface.js';
// import { extractPriceData } from './utils.js';
// import FrontEndWebsocket from './sendFrontEndData.js';

// const frontEndData = new FrontEndWebsocket();

// class BybitPriceData extends EventEmitter {
//   private wsClient: WebsocketClient;
//   constructor() {
//     super();
//     this.wsClient = new WebsocketClient({
//       market: 'v5',
//     });
//   }

//   public initializeWebsocket(): void {
//     if (!this.wsClient) return;
//     this.wsClient.on('update', async (data: V5WsData) => {
//       if (data.wsKey === 'v5LinearPublic') {
//         const priceData = extractPriceData(data);

//         frontEndData.sendWebsocketData(priceData);
//         this.emit('percentage', priceData);
//         console.log('Price update: ', priceData);
//       }
//     });

//     this.wsClient.on('open', () => {
//       console.log('Websocket opened');
//     });

//     this.wsClient.on('reconnect', () => {
//       console.log('Reconnecting...');
//     });

//     this.wsClient.on('reconnected', () => {
//       console.log('Reconnected');
//     });

//     this.wsClient.on('response', (data) => {
//       console.log('Log response: ', JSON.stringify(data, null, 2));
//     });
//   }
// }

// export default BybitPriceData;
