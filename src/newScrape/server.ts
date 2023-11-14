import express, { Express } from 'express';
import cors from 'cors';
import { sendAccountInfoRequest } from './utils.js';

const startServer = (): void => {
  const app: Express = express();
  const PORT = Number(process.env.PORT);

  app.use(cors());
  app.use(express.json());

  sendAccountInfoRequest(app);

  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
};

export default startServer;
