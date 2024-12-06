import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  return res.status(500).json({
    error: 'Erro interno do servidor'
  });
} 