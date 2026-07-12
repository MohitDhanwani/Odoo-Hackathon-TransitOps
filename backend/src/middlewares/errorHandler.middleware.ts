import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { errorResponse } from '../utils/apiResponse';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(errorResponse(err.message));
  }

  if (err instanceof ZodError) {
    const message = (err as any).errors.map((e: any) => e.message).join(', ');
    return res.status(400).json(errorResponse(message, 'VALIDATION_ERROR'));
  }

  console.error('Unhandled error:', err);
  return res.status(500).json(errorResponse('Internal Server Error'));
};
