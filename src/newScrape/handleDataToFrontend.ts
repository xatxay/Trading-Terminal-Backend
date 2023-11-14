import TreeNews from './treeNews.js';
import { BybitPrice, FrontEndWebsocket } from './getPrice.js';
import DataCombine from './sendData.js';

const sendDataFrontEnd = (): void => {
  const tree = new TreeNews(process.env.TREENEWS);
  const price = new BybitPrice();
  const combine = new DataCombine(tree, price);
  const sendData = new FrontEndWebsocket();

  combine.on('combineData', (data) => {
    console.log('combineData: ', data);
    const dataString = JSON.stringify(data);
    sendData.sendWebsocketData(dataString);
  });
};

export default sendDataFrontEnd;
