import { Request, Response } from 'express';
import { db } from '../../config/db';
import { vehicles, trips, drivers } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { successResponse } from '../../utils/apiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const { type, status, region } = req.query;

  // Vehicle filters
  const vConditions = [];
  if (type) vConditions.push(eq(vehicles.type, type as string));
  if (status) vConditions.push(eq(vehicles.status, status as any));
  if (region) vConditions.push(eq(vehicles.region, region as string));

  const filteredVehicles = await db.select().from(vehicles)
    .where(vConditions.length > 0 ? and(...vConditions) : undefined);

  let totalVehicles = 0;
  let activeVehicles = 0;
  let availableVehicles = 0;
  let maintenanceVehicles = 0;
  let onTripVehicles = 0;

  for (const v of filteredVehicles) {
    if (v.status !== 'retired') totalVehicles++;
    // We assume "Active Vehicles" means not retired, not in shop? 
    // Usually Active means total non-retired, or currently doing something. 
    // The PRD implies Fleet Utilization = on_trip / total non-retired.
    if (v.status !== 'retired') activeVehicles++;
    if (v.status === 'available') availableVehicles++;
    if (v.status === 'in_shop') maintenanceVehicles++;
    if (v.status === 'on_trip') onTripVehicles++;
  }

  const [activeTripsResult] = await db.select({ count: sql<number>`count(*)` }).from(trips).where(eq(trips.status, 'dispatched'));
  const activeTripsCount = Number(activeTripsResult.count);

  const [pendingTripsResult] = await db.select({ count: sql<number>`count(*)` }).from(trips).where(eq(trips.status, 'draft'));
  const pendingTripsCount = Number(pendingTripsResult.count);

  const [driversOnDutyResult] = await db.select({ count: sql<number>`count(*)` }).from(drivers).where(eq(drivers.status, 'on_trip'));
  const driversOnDutyCount = Number(driversOnDutyResult.count);

  const fleetUtilization = totalVehicles > 0 ? (onTripVehicles / totalVehicles) * 100 : 0;

  return res.json(successResponse({
    activeVehicles,
    availableVehicles,
    maintenanceVehicles,
    activeTrips: activeTripsCount,
    pendingTrips: pendingTripsCount,
    driversOnDuty: driversOnDutyCount,
    fleetUtilization: parseFloat(fleetUtilization.toFixed(2)),
  }));
});
