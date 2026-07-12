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

  const result = await db.query.expenses.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      vehicle: true,
    },
    orderBy: (expenses, { desc }) => [desc(expenses.createdAt)],
  });

  return res.json(successResponse(result));
});

export const createExpense = catchAsync(async (req: Request, res: Response) => {
  const [expense] = await db.insert(expenses).values(req.body).returning();
  const expenseWithRelations = await db.query.expenses.findFirst({
    where: eq(expenses.id, expense.id),
    with: { vehicle: true }
  });
  return res.status(201).json(successResponse(expenseWithRelations));
});
