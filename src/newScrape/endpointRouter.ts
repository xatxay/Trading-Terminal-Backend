import express from 'express';
import { AccountInfo } from './routes.js';

const router = express.Router();
const account = new AccountInfo();

router.get(
  '/accountSummary',
  account.authenticateToken,
  account.accountSummaryHandler(),
);
router.get(
  '/positions',
  account.authenticateToken,
  account.openPositionHandler(),
);
router.post('/start', account.authenticateToken, account.startButtonHandler());
router.post('/stop', account.authenticateToken, account.stopButtonHandler());
router.post(
  '/closeAll',
  account.authenticateToken,
  account.closeAllButtonHandler(),
);
router.post('/close', account.authenticateToken, account.closeButtonHandler());
router.post(
  'submitOrder',
  account.authenticateToken,
  account.submitOrderHandler(),
);
router.post('/logout', account.authenticateToken, account.logoutHandler());
router.post('/login', account.loginHandler());
router.post('/register', account.createAccountHandler());
router.post(
  '/apiSubmit',
  account.authenticateToken,
  account.submitApiHandler(),
);
router.post(
  '/apiCheck',
  account.authenticateToken,
  account.checkSubmittedApi(),
);

export default router;
