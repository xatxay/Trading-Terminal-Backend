import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const isJwtPayload = (object: unknown): object is JwtPayload => {
  return object && typeof object === 'object' && 'userId' in object;
};

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.log('authmiddleware: ', req);
  const token = req.header('Authorization')?.split(' ')[1];
  console.log('token: ', token);

  if (!token) {
    res.status(401).send('Access denied');
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (isJwtPayload(decoded)) {
      req.user = decoded;
      next();
    } else {
      throw new Error('Invalid token payload');
    }
  } catch (err) {
    console.error('Error authenticate user: ', err);
    res.status(400).send('Invalid token');
  }
};

export default authMiddleware;
