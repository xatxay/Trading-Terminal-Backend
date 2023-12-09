import express, { Express } from 'express';
import cors from 'cors';
import endpointRouter from './endpointRouter.js';
import rateLimit from 'express-rate-limit';
// import { sendAccountInfoRequest } from './utils.js';
// import session from 'express-session';

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 1000,
});

const startServer = (): void => {
  const app: Express = express();
  const PORT = Number(process.env.PORT);

  // const corsOptions = {
  //   // TODO: allow for all traffic (done)
  //   origin: 'http://localhost:3000',
  //   credentials: true,
  // };

  // app.use(
  //   session({
  //     secret: 'thisismysecretkey',
  //     resave: false,
  //     saveUninitialized: true,
  //     cookie: { httpOnly: true, secure: true },
  //   }),
  // );
  app.use(cors());
  app.use(express.json());
  app.use(endpointRouter);
  app.use(apiLimiter);

  // sendAccountInfoRequest(app);

  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
};

export default startServer;
