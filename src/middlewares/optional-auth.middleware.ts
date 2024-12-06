import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from './auth.middleware';

export const optionalAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
    return next();
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: number };
    req.userId = decoded.userId;
  } catch (err) {
    return next();
  }

  return next();
};
