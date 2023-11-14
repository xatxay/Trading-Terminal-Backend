import express, { Express } from 'express';
import cors from 'cors';
import { NewsWebsocket } from './routes.js';
import { sendAccountInfoRequest, treeWebsocket } from './utils.js';

const startServer = (): void => {
  const app: Express = express();
  const PORT = Number(process.env.PORT);

  app.use(cors());
  app.use(express.json());

  const treeNews = treeWebsocket();
  treeNews.on('news', (newsMessage: unknown) => {
    console.log('TREENEWS: ', newsMessage);
    const treeNewsWebsocket = new NewsWebsocket(app, newsMessage);
    treeNewsWebsocket.getNewsRequest();
  });

  sendAccountInfoRequest(app);

  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
};

export default startServer;
