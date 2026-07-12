import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { env } from '../config/env';
import { errorResponse } from '../utils/apiResponse';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies[env.COOKIE_NAME];
    if (!token) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const decoded = verifyToken(token);
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Unauthorized: Invalid or expired token'));
  }
};
