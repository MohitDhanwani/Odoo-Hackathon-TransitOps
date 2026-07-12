import { Request, Response } from 'express';
import { db } from '../../config/db';
import { vehicles } from '../../db/schema';
import { eq, and, notInArray } from 'drizzle-orm';
import { ApiError } from '../../utils/apiError';
import { successResponse } from '../../utils/apiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getVehicles = catchAsync(async (req: Request, res: Response) => {
  const { type, status, region } = req.query;

  const conditions = [];
  if (type) conditions.push(eq(vehicles.type, type as string));
  if (status) conditions.push(eq(vehicles.status, status as any));
  if (region) conditions.push(eq(vehicles.region, region as string));

  const query = db.select().from(vehicles);
  const result = conditions.length > 0 
    ? await query.where(and(...conditions))
    : await query;

  return res.json(successResponse(result));
});

export const getAvailableVehicles = catchAsync(async (req: Request, res: Response) => {
  // A vehicle with status retired or in_shop must never show up in the "available vehicles for dispatch" list.
  // We can just fetch status = 'available', or notInArray(['retired', 'in_shop', 'on_trip']).
  // The PRD implies available status is the exact criteria.
  const result = await db.select().from(vehicles).where(eq(vehicles.status, 'available'));
  return res.json(successResponse(result));
});

export const getVehicleById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  return res.json(successResponse(vehicle));
});

export const createVehicle = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  
  const [existing] = await db.select().from(vehicles).where(eq(vehicles.registrationNumber, data.registrationNumber));
  if (existing) {
    throw new ApiError(409, 'Vehicle with this registration number already exists');
  }

  const [vehicle] = await db.insert(vehicles).values(data).returning();
  return res.status(201).json(successResponse(vehicle));
});

export const updateVehicle = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = req.body;

  const [vehicle] = await db.update(vehicles).set(data).where(eq(vehicles.id, id)).returning();
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  
  return res.json(successResponse(vehicle));
});

export const deleteVehicle = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const [vehicle] = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  return res.json(successResponse({ deleted: true }));
});
