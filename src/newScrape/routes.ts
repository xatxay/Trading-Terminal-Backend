import { NextFunction, Request, Response } from 'express';
import { Wallet } from '../interface.js';
import BybitTrading from './bybit.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  closeAllButton,
  closeButton,
  startButton,
  stopButton,
  submitNewsOrder,
} from './utils.js';
import { selectUser } from '../tradeData/tradeAnalyzeUtils.js';
import { createUser, checkExistingUser } from '../login/userDatabase.js';

class AccountInfo {
  private bybitAccount: Wallet;

  constructor() {
    this.bybitAccount = new BybitTrading('');
  }

  public authenticateToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Access Denied: No Token Provided' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid Token' });
    }
  }

  public accountSummaryHandler() {
    return async (_req: Request, res: Response): Promise<void> => {
      try {
        const data = await this.bybitAccount.getWalletBalance();
        res.json(data);
      } catch (err) {
        res.status(500).send(err.message);
      }
    };
  }

  public openPositionHandler() {
    return async (_req: Request, res: Response): Promise<void> => {
      try {
        const data = await this.bybitAccount.getAllOpenPosition();
        res.json(data);
      } catch (err) {
        res.status(500).send(err.message);
      }
    };
  }

  public startButtonHandler() {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        startButton(); //log for now
        res.send({ message: 'starting...' });
        console.log('req: ', req.user);
      } catch (err) {
        res.status(500).send(err.message);
      }
    };
  }

  public stopButtonHandler() {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        stopButton(); //log for now
        res.send({ message: 'stopping...' });
        console.log('req: ', req.user);
      } catch (err) {
        res.status(500).send(err.message);
      }
    };
  }

  public closeAllButtonHandler() {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        closeAllButton(); //log for now
        res.send({ message: 'closing all...' });
        console.log('req: ', req.user);
      } catch (err) {
        res.status(500).send(err.message);
      }
    };
  }

  public closeButtonHandler() {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        console.log('reqbody: ', req.body);
        const { side, symbol } = req.body;
        const response = await closeButton(symbol, side);
        response.retCode === 0
          ? res.send({ message: `closing ${symbol}` })
          : res.send({ message: `Error closing: ${response.retMsg}` });
      } catch (err) {
        res.status(500).send(err.message);
      }
    };
  }

  public submitOrderHandler() {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        console.log('reqbody: ', req.body);
        const { side, symbol, percentage } = req.body;
        await submitNewsOrder(symbol, side, percentage);
        res.send({ message: `${side} ${symbol} ${percentage}` });
      } catch (err) {
        res.status(500).send(err.message);
      }
    };
  }

  public logoutHandler() {
    return (req: Request, res: Response): void => {
      req.session.destroy((err) => {
        err
          ? res.status(500).send(err.message)
          : res.send('Logged out successfully');
      });
    };
  }

  public loginHandler() {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        const { username, password } = req.body;
        console.log('Login: ', username, password);
        const user = await selectUser(username);
        if (!user) {
          res.status(400).json({ message: 'Invalid username' });
          return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          res.status(400).json({ message: 'Invalid password' });
          return;
        }

        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });
        res.json({ token });
      } catch (err) {
        res.status(500).send('Server Error');
      }
    };
  }

  public createAccountHandler() {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        const { email, password } = req.body;
        const result = await checkExistingUser(email);
        if (result > 0) {
          res.status(400).json({ message: 'User already exists' });
          return;
        }
        console.log('New user: ', email, password);
        await createUser(email, password);
        res.status(201).json({ message: 'User created successfully' });
      } catch (err) {
        res.status(500).json({ message: 'Error creating user: ', err });
      }
    };
  }
}

export { AccountInfo };
