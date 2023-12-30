import { JwtPayload } from 'jsonwebtoken';
import { Decoded } from './src/interface.ts';
// import session from 'express-session';

// declare module 'express-session' {
//   interface SessionData {
//     userId?: number;
//   }
// }

declare module 'express-serve-static-core' {
  interface Request {
    user?: Decoded;
  }
}
