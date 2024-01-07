import express, { Request, Response } from 'express';
import { AccountInfo } from './routes.js';

const router = express.Router();
const account = new AccountInfo();

router.get('/heath', (_req: Request, res: Response) => {
  res.status(200).send({ message: 'hello world' });
});

router.get(
  '/accountSummary',
  account.authenticateToken,
  account.clientInit.bind(account),
  account.accountSummaryHandler.bind(account),
);
router.get(
  '/positions',
  account.authenticateToken,
  account.clientInit.bind(account),
  account.openPositionHandler.bind(account),
);
router.post(
  '/start',
  account.authenticateToken,
  account.clientInit.bind(account),
  account.startButtonHandler,
);
router.post(
  '/stop',
  account.authenticateToken,
  account.clientInit.bind(account),
  account.stopButtonHandler,
);
router.post(
  '/closeAll',
  account.authenticateToken,
  account.clientInit.bind(account),
  account.closeAllButtonHandler,
);
router.post(
  '/close',
  account.authenticateToken,
  account.clientInit.bind(account),
  account.closeButtonHandler,
);
router.post(
  '/submitOrder',
  account.authenticateToken,
  account.clientInit.bind(account),
  account.submitOrderHandler,
);
router.post('/logout', account.authenticateToken, account.logoutHandler);
router.post('/login', account.clientReset.bind(account), account.loginHandler);
router.post('/register', account.createAccountHandler);
router.post('/apiSubmit', account.authenticateToken, account.submitApiHandler);
router.post('/apiCheck', account.authenticateToken, account.checkSubmittedApi);
router.post('/openAi', account.authenticateToken, account.submitOpenAiHandler);
router.post(
  '/openAiCheck',
  account.authenticateToken,
  account.checkSubmittedOpenAi,
);

export default router;
