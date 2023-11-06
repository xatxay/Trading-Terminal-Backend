import WebSocket from 'ws';
import { TreeNewsMessage } from '../interface.js';
import { TickerAndSentiment } from '../interface.js';
// import { selectProxy } from '../proxy/manageDb.js';
// import ProxyManager from '../proxy/proxyManager.js';

function extractWsData(data: WebSocket.RawData): TreeNewsMessage {
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

// const proxyManage = async (): Promise<string> => {
//   const allProxies = await selectProxy();
//   const proxy = new ProxyManager(allProxies);
//   const nextProxy = proxy.getNextProxy();
//   console.log('current proxy: ', nextProxy);
//   return nextProxy;
// };

export { extractWsData, extractString };
