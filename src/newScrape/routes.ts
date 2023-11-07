import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { Wallet } from '../interface.js';
import BybitTrading from './bybit.js';

class Routes {
  private app: Express;
  private PORT: number;
  private walletBalance: Wallet;

  constructor() {
    this.app = express();
    this.PORT = 5000;
    // this.app.use(express.json());
    this.app.use(cors());
    this.walletBalance = new BybitTrading('');

    this.listenPort();
  }

  private listenPort(): void {
    this.app.listen(this.PORT, () => {
      console.log(`http://localhost:${this.PORT}/accountSummary`);
    });
  }

  public getRequest(): void {
    this.app.get('/accountSummary', async (_req: Request, res: Response) => {
      try {
        const accountSummary = await this.walletBalance.getWalletBalance();
        res.json(accountSummary);
      } catch (err) {
        res.status(500).send(err.message);
      }
    });
  }
}

export default Routes;
