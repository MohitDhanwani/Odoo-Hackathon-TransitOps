import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json(errorResponse('Forbidden: Insufficient permissions'));
    }
    
    next();
  };
};
