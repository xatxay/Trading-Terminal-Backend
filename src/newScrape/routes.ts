import { Express, Request, Response } from 'express';
import { AccountSummary, Wallet } from '../interface.js';
import BybitTrading from './bybit.js';
import {
  closeAllButton,
  closeButton,
  startButton,
  stopButton,
  submitNewsOrder,
} from './utils.js';

class AccountInfo {
  private bybitAccount: Wallet;
  private app: Express;

  constructor(app: Express) {
    this.bybitAccount = new BybitTrading('');
    this.app = app;
  }

  public getRequest(endpoint: string): void {
    this.app.get(endpoint, async (_req: Request, res: Response) => {
      try {
        let data: AccountSummary | unknown;
        if (endpoint === '/accountSummary') {
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

  public postRequest(endpoint: string): void {
    this.app.post(endpoint, (req, res) => {
      switch (endpoint) {
        case '/start': {
          startButton();
          res.send({ message: 'starting...' });
          break;
        }
        case '/stop': {
          stopButton();
          res.send({ message: 'stop...' });
          break;
        }
        case '/closeAll': {
          closeAllButton();
          res.send({ message: 'closing all...' });
          break;
        }
        case '/close': {
          console.log('reqbody: ', req.body);
          const { side, symbol } = req.body;
          closeButton(symbol, side);
          res.send({ message: 'closing...' });
          break;
        }
        case '/submitOrder': {
          console.log('reqbody: ', req.body);
          const { side, symbol, percentage } = req.body;
          submitNewsOrder(symbol, side, +percentage);
          res.send({ message: `${side} ${symbol} ${percentage}%` });
          break;
        }
      }
    });
  }
}

// class NewsWebsocket {
//   private app: Express;
//   private data: unknown;

//   constructor(app: Express, data: unknown) {
//     this.data = data;
//     this.app = app;
//   }

//   public getNewsRequest(): void {
//     this.app.get('/news', async (_req: Request, res: Response) => {
//       try {
//         res.send(this.data);
//       } catch (err) {
//         res.status(500).send(err.message);
//       }
//     });
//   }
// }

export { AccountInfo };
