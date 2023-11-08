import { Express, Request, Response } from 'express';
import { AccountSummary, Wallet } from '../interface.js';
import BybitTrading from './bybit.js';

class AccountInfo {
  private bybitAccount: Wallet;
  private app: Express;
  private endpoint: string;

  constructor(app: Express, endpoint: string) {
    this.bybitAccount = new BybitTrading('');
    this.app = app;
    this.endpoint = endpoint;
  }

  public getRequest(): void {
    this.app.get(this.endpoint, async (_req: Request, res: Response) => {
      try {
        let data: AccountSummary | unknown;
        if (this.endpoint === '/accountSummary') {
          data = await this.bybitAccount.getWalletBalance();
        } else {
          data = await this.bybitAccount.getAllOpenPosition();
        }
        res.json(data);
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
