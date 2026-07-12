import { Request, Response } from 'express';
import { db } from '../../config/db';
import { maintenanceLogs, vehicles } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { ApiError } from '../../utils/apiError';
import { successResponse } from '../../utils/apiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getMaintenanceLogs = catchAsync(async (req: Request, res: Response) => {
  const { status, vehicleId } = req.query;

  const conditions = [];
  if (status) conditions.push(eq(maintenanceLogs.status, status as any));
  if (vehicleId) conditions.push(eq(maintenanceLogs.vehicleId, vehicleId as string));

  const result = await db.query.maintenanceLogs.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      vehicle: true,
    },
    orderBy: (maintenanceLogs, { desc }) => [desc(maintenanceLogs.createdAt)],
  });

  return res.json(successResponse(result));
});

export const createMaintenanceLog = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, data.vehicleId));
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  const [log] = await db.insert(maintenanceLogs).values({
    ...data,
    status: 'active',
  }).returning();

  // Rule 9: Creating a maintenance record with status 'active' immediately sets the vehicle's status to 'in_shop'
  await db.update(vehicles).set({ status: 'in_shop' }).where(eq(vehicles.id, vehicle.id));

  const logWithRelations = await db.query.maintenanceLogs.findFirst({
    where: eq(maintenanceLogs.id, log.id),
    with: { vehicle: true }
  });

  return res.status(201).json(successResponse(logWithRelations));
});

export const closeMaintenanceLog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const [log] = await db.select().from(maintenanceLogs).where(eq(maintenanceLogs.id, id));
  if (!log) throw new ApiError(404, 'Maintenance log not found');
  if (log.status === 'closed') throw new ApiError(400, 'Maintenance log is already closed');

  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, log.vehicleId));
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  const [updatedLog] = await db.update(maintenanceLogs)
    .set({ status: 'closed', closedAt: new Date() })
    .where(eq(maintenanceLogs.id, id))
    .returning();

  // Rule 10: Closing restores vehicle to available, unless retired
  if (vehicle.status !== 'retired') {
    await db.update(vehicles).set({ status: 'available' }).where(eq(vehicles.id, vehicle.id));
  }

  const updatedLogWithRelations = await db.query.maintenanceLogs.findFirst({
    where: eq(maintenanceLogs.id, updatedLog.id),
    with: { vehicle: true }
  });

  return res.json(successResponse(updatedLogWithRelations));
});
