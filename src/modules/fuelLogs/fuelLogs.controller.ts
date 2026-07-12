import { Request, Response } from 'express';
import { db } from '../../config/db';
import { fuelLogs } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { successResponse } from '../../utils/apiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getFuelLogs = catchAsync(async (req: Request, res: Response) => {
  const { vehicleId } = req.query;

  const query = db.select().from(fuelLogs);
  const result = vehicleId 
    ? await query.where(eq(fuelLogs.vehicleId, vehicleId as string))
    : await query;

  return res.json(successResponse(result));
});

export const createFuelLog = catchAsync(async (req: Request, res: Response) => {
  const [log] = await db.insert(fuelLogs).values(req.body).returning();
  return res.status(201).json(successResponse(log));
});
