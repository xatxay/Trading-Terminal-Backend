import express, { Express } from 'express';
import cors from 'cors';
import { sendAccountInfoRequest } from './utils.js';
// import session from 'express-session';

const startServer = (): void => {
  const app: Express = express();
  const PORT = Number(process.env.PORT);

  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
  };

  // app.use(
  //   session({
  //     secret: 'thisismysecretkey',
  //     resave: false,
  //     saveUninitialized: true,
  //     cookie: { httpOnly: true, secure: true },
  //   }),
  // );
  app.use(cors(corsOptions));
  app.use(express.json());

  sendAccountInfoRequest(app);

  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
};

export default startServer;
