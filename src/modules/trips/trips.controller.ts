import { Request, Response } from 'express';
import { db } from '../../config/db';
import { trips } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { ApiError } from '../../utils/apiError';
import { successResponse } from '../../utils/apiResponse';
import { catchAsync } from '../../utils/catchAsync';
import { tripsService } from './trips.service';

export const getTrips = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.query;

  const conditions = [];
  if (status) conditions.push(eq(trips.status, status as any));

  const result = await db.query.trips.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      vehicle: true,
      driver: true,
    },
    orderBy: (trips, { desc }) => [desc(trips.createdAt)],
  });

  return res.json(successResponse(result));
});

export const getTripById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, id),
    with: {
      vehicle: true,
      driver: true,
    },
  });
  if (!trip) throw new ApiError(404, 'Trip not found');
  return res.json(successResponse(trip));
});

export const createTrip = catchAsync(async (req: Request, res: Response) => {
  const data = {
    ...req.body,
    createdById: (req as any).user.userId,
  };
  const trip = await tripsService.createDispatched(data);
  const tripWithRelations = await db.query.trips.findFirst({
    where: eq(trips.id, trip.id),
    with: { vehicle: true, driver: true }
  });
  return res.status(201).json(successResponse(tripWithRelations));
});

export const dispatchTrip = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const trip = await tripsService.dispatch(id);
  const tripWithRelations = await db.query.trips.findFirst({
    where: eq(trips.id, trip.id),
    with: { vehicle: true, driver: true }
  });
  return res.json(successResponse(tripWithRelations));
});

export const completeTrip = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { actualDistance, fuelConsumed } = req.body;
  const trip = await tripsService.complete(id, actualDistance, fuelConsumed);
  const tripWithRelations = await db.query.trips.findFirst({
    where: eq(trips.id, trip.id),
    with: { vehicle: true, driver: true }
  });
  return res.json(successResponse(tripWithRelations));
});

export const cancelTrip = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const trip = await tripsService.cancel(id);
  const tripWithRelations = await db.query.trips.findFirst({
    where: eq(trips.id, trip.id),
    with: { vehicle: true, driver: true }
  });
  return res.json(successResponse(tripWithRelations));
});
