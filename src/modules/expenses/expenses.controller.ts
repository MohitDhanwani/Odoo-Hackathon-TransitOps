import { Request, Response } from 'express';
import { db } from '../../config/db';
import { expenses } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { successResponse } from '../../utils/apiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getExpenses = catchAsync(async (req: Request, res: Response) => {
  const { vehicleId, type } = req.query;

  const conditions = [];
  if (vehicleId) conditions.push(eq(expenses.vehicleId, vehicleId as string));
  if (type) conditions.push(eq(expenses.type, type as string));

  const query = db.select().from(expenses);
  const result = conditions.length > 0 
    ? await query.where(and(...conditions))
    : await query;

  return res.json(successResponse(result));
});

export const createExpense = catchAsync(async (req: Request, res: Response) => {
  const [expense] = await db.insert(expenses).values(req.body).returning();
  return res.status(201).json(successResponse(expense));
});
