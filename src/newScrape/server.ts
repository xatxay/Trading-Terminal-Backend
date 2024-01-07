import express, { Express } from 'express';
import cors from 'cors';
import endpointRouter from './endpointRouter.js';
import rateLimit from 'express-rate-limit';
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 1000,
});

const startServer = (): void => {
  const app: Express = express();
  const PORT = Number(process.env.PORT) || 443;

  // const corsOptions = {
  //   // TODO: allow for all traffic (done)
  //   origin: 'http://localhost:3000',
  //   credentials: true,
  // };

  app.use(cors());
  app.use(express.json());
  app.use(endpointRouter);
  app.use(apiLimiter);

  const privateKeyPath = process.env.PRIVATE_KEY_PATH;
  const certificatePath = process.env.CERTIFICATE_PATH;
  const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
  const certificate = fs.readFileSync(certificatePath, 'utf-8');

  const credentials = { key: privateKey, cert: certificate };

  const httosServer = https.createServer(credentials, app);

  httosServer.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
  });

  // app.listen(PORT, () => {
  //   console.log(`http://localhost:${PORT}`);
  // });
};

export default startServer;
