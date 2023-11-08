import { Express, Request, Response } from 'express';
import { Wallet } from '../interface.js';
import BybitTrading from './bybit.js';

class AccountInfo {
  private bybitAccount: Wallet;
  private app: Express;

  constructor(app: Express) {
    this.bybitAccount = new BybitTrading('');
    this.app = app;
  }

  public getRequest(): void {
    this.app.get('/accountSummary', async (_req: Request, res: Response) => {
      try {
        const accountSummary = await this.bybitAccount.getWalletBalance();
        const openPosition = await this.bybitAccount.getAllOpenPosition();

        const info = {
          accountSummary,
          openPosition,
        };
        res.json(info);
      } catch (err) {
        res.status(500).send(err.message);
      }
    });
  }
}

class NewsWebsocket {
  private app: Express;
  private data: unknown;

  constructor(app: Express, data: unknown) {
    this.data = data;
    this.app = app;
  }

  public getNewsRequest(): void {
    this.app.get('/news', async (_req: Request, res: Response) => {
      try {
        res.send(this.data);
      } catch (err) {
        res.status(500).send(err.message);
      }
    });
  }
}

export { AccountInfo, NewsWebsocket };
