import { Request, Response } from 'express';
import { db } from '../../config/db';
import { fuelLogs } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { successResponse } from '../../utils/apiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getFuelLogs = catchAsync(async (req: Request, res: Response) => {
  const { vehicleId } = req.query;

  const result = await db.query.fuelLogs.findMany({
    where: vehicleId ? eq(fuelLogs.vehicleId, vehicleId as string) : undefined,
    with: {
      vehicle: true,
      trip: true,
    },
    orderBy: (fuelLogs, { desc }) => [desc(fuelLogs.createdAt)],
  });

  return res.json(successResponse(result));
});

export const createFuelLog = catchAsync(async (req: Request, res: Response) => {
  const [log] = await db.insert(fuelLogs).values(req.body).returning();
  const logWithRelations = await db.query.fuelLogs.findFirst({
    where: eq(fuelLogs.id, log.id),
    with: { vehicle: true, trip: true }
  });
  return res.status(201).json(successResponse(logWithRelations));
});
