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
import { selectUser } from '../login/createUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    this.app.post(endpoint, async (req, res): Promise<void> => {
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
        case '/login': {
          const { username, password } = req.body;
          console.log('Login: ', username, password);
          try {
            const user = await selectUser(username);
            if (!user) {
              res.status(400).send('Invalid username');
              return;
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
              res.status(400).send('Invalid password');
            }

            const payload = { userId: user.id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
              expiresIn: process.env.JWT_EXPIRE,
            });

            res.json({ token });
          } catch (err) {
            console.error('Error logging in: ', err);
            res.status(500).send('Server error');
          }
          break;
        }
      }
    });
  }
}

export { AccountInfo };
