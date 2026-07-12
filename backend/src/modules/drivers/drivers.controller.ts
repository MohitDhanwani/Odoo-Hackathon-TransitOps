import { Request, Response } from 'express';
import { db } from '../../config/db';
import { drivers } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ApiError } from '../../utils/apiError';
import { successResponse } from '../../utils/apiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getDrivers = catchAsync(async (req: Request, res: Response) => {
  const { status, licenseCategory } = req.query;

  const conditions = [];
  if (status) conditions.push(eq(drivers.status, status as any));
  if (licenseCategory) conditions.push(eq(drivers.licenseCategory, licenseCategory as string));

  const query = db.select().from(drivers);
  const result = conditions.length > 0 
    ? await query.where(and(...conditions))
    : await query;

  return res.json(successResponse(result));
});

export const getAvailableDrivers = catchAsync(async (req: Request, res: Response) => {
  // A driver with status suspended, or whose licenseExpiryDate is in the past, must never show up
  // also not on_trip (handled by status = available)
  const result = await db.select().from(drivers).where(
    and(
      eq(drivers.status, 'available'),
      sql`${drivers.licenseExpiryDate} > CURRENT_DATE`
    )
  );
  return res.json(successResponse(result));
});

export const getCompliance = catchAsync(async (req: Request, res: Response) => {
  // list of drivers with expired/soon-to-expire licenses (e.g., within 30 days) or low safety scores (e.g., < 80)
  const result = await db.select().from(drivers).where(
    sql`${drivers.licenseExpiryDate} <= CURRENT_DATE + INTERVAL '30 days' OR CAST(${drivers.safetyScore} AS NUMERIC) < 80`
  );
  return res.json(successResponse(result));
});

export const getDriverById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
  if (!driver) throw new ApiError(404, 'Driver not found');
  return res.json(successResponse(driver));
});

export const createDriver = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  
  const [existing] = await db.select().from(drivers).where(eq(drivers.licenseNumber, data.licenseNumber));
  if (existing) {
    throw new ApiError(409, 'Driver with this license number already exists');
  }

  const [driver] = await db.insert(drivers).values(data).returning();
  return res.status(201).json(successResponse(driver));
});

export const updateDriver = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = req.body;

  const [driver] = await db.update(drivers).set(data).where(eq(drivers.id, id)).returning();
  if (!driver) throw new ApiError(404, 'Driver not found');
  
  return res.json(successResponse(driver));
});

export const deleteDriver = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const [driver] = await db.delete(drivers).where(eq(drivers.id, id)).returning();
  if (!driver) throw new ApiError(404, 'Driver not found');
  return res.json(successResponse({ deleted: true }));
});
