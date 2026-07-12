import { Request, Response } from 'express';
import { db } from '../../config/db';
import { vehicles, trips, maintenanceLogs, fuelLogs } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { successResponse } from '../../utils/apiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getFuelEfficiency = catchAsync(async (req: Request, res: Response) => {
  const result = await db.select({
    vehicleId: vehicles.id,
    registrationNumber: vehicles.registrationNumber,
    totalDistance: sql<number>`SUM(CAST(${trips.actualDistance} AS NUMERIC))`,
    totalFuelLiters: sql<number>`SUM(CAST(${fuelLogs.liters} AS NUMERIC))`,
  })
  .from(vehicles)
  .leftJoin(trips, eq(vehicles.id, trips.vehicleId))
  .leftJoin(fuelLogs, eq(vehicles.id, fuelLogs.vehicleId))
  .groupBy(vehicles.id);

  const efficiency = result.map(r => ({
    ...r,
    efficiency: r.totalFuelLiters > 0 ? (r.totalDistance / r.totalFuelLiters).toFixed(2) : '0'
  }));

  return res.json(successResponse(efficiency));
});

export const getFleetUtilization = catchAsync(async (req: Request, res: Response) => {
  const vehiclesData = await db.select().from(vehicles);
  let totalVehicles = 0;
  let onTripVehicles = 0;

  for (const v of vehiclesData) {
    if (v.status !== 'retired') totalVehicles++;
    if (v.status === 'on_trip') onTripVehicles++;
  }

  const utilization = totalVehicles > 0 ? (onTripVehicles / totalVehicles) * 100 : 0;

  return res.json(successResponse({ utilizationPercentage: parseFloat(utilization.toFixed(2)) }));
});

export const getOperationalCost = catchAsync(async (req: Request, res: Response) => {
  const result = await db.select({
    vehicleId: vehicles.id,
    registrationNumber: vehicles.registrationNumber,
    fuelCost: sql<number>`COALESCE(SUM(CAST(${fuelLogs.cost} AS NUMERIC)), 0)`,
  })
  .from(vehicles)
  .leftJoin(fuelLogs, eq(vehicles.id, fuelLogs.vehicleId))
  .groupBy(vehicles.id);

  const maintenanceResult = await db.select({
    vehicleId: vehicles.id,
    maintenanceCost: sql<number>`COALESCE(SUM(CAST(${maintenanceLogs.cost} AS NUMERIC)), 0)`,
  })
  .from(vehicles)
  .leftJoin(maintenanceLogs, eq(vehicles.id, maintenanceLogs.vehicleId))
  .groupBy(vehicles.id);

  const costData = result.map(r => {
    const m = maintenanceResult.find(mx => mx.vehicleId === r.vehicleId);
    const mCost = m ? Number(m.maintenanceCost) : 0;
    const fCost = Number(r.fuelCost);
    return {
      vehicleId: r.vehicleId,
      registrationNumber: r.registrationNumber,
      fuelCost: fCost,
      maintenanceCost: mCost,
      totalCost: fCost + mCost,
    };
  });

  return res.json(successResponse(costData));
});

export const getVehicleROI = catchAsync(async (req: Request, res: Response) => {
  // ROI = (revenue - (maintenanceCost + fuelCost)) / acquisitionCost
  // Revenue comes from trips (sum of revenue)
  const costQuery = await db.select({
    vehicleId: vehicles.id,
    registrationNumber: vehicles.registrationNumber,
    acquisitionCost: vehicles.acquisitionCost,
    fuelCost: sql<number>`COALESCE((SELECT SUM(CAST(cost AS NUMERIC)) FROM fuel_logs WHERE vehicle_id = vehicles.id), 0)`,
    maintenanceCost: sql<number>`COALESCE((SELECT SUM(CAST(cost AS NUMERIC)) FROM maintenance_logs WHERE vehicle_id = vehicles.id), 0)`,
    revenue: sql<number>`COALESCE((SELECT SUM(CAST(revenue AS NUMERIC)) FROM trips WHERE vehicle_id = vehicles.id), 0)`
  }).from(vehicles);

  const roiData = costQuery.map(r => {
    const acqCost = parseFloat(r.acquisitionCost as string) || 1; // avoid division by zero
    const totalCost = Number(r.fuelCost) + Number(r.maintenanceCost);
    const revenue = Number(r.revenue);
    const roi = (revenue - totalCost) / acqCost;

    return {
      vehicleId: r.vehicleId,
      registrationNumber: r.registrationNumber,
      acquisitionCost: acqCost,
      totalCost,
      revenue,
      roi: parseFloat(roi.toFixed(2)),
    };
  });

  return res.json(successResponse(roiData));
});

export const exportCSV = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.query;
  let data: any[] = [];

  // Since we already have the logic above, we can just call it via mock req/res or copy logic.
  // For simplicity, we just copy the fetch logic here.
  
  if (type === 'fuel-efficiency') {
    const result = await db.select({
      vehicleId: vehicles.id,
      registrationNumber: vehicles.registrationNumber,
      totalDistance: sql<number>`COALESCE((SELECT SUM(CAST(actual_distance AS NUMERIC)) FROM trips WHERE vehicle_id = vehicles.id), 0)`,
      totalFuelLiters: sql<number>`COALESCE((SELECT SUM(CAST(liters AS NUMERIC)) FROM fuel_logs WHERE vehicle_id = vehicles.id), 0)`,
    }).from(vehicles);
    
    data = result.map(r => ({
      Vehicle_ID: r.vehicleId,
      Registration_Number: r.registrationNumber,
      Total_Distance: r.totalDistance,
      Total_Fuel_Liters: r.totalFuelLiters,
      Efficiency: Number(r.totalFuelLiters) > 0 ? (Number(r.totalDistance) / Number(r.totalFuelLiters)).toFixed(2) : '0'
    }));

  } else if (type === 'operational-cost') {
    const result = await db.select({
      vehicleId: vehicles.id,
      registrationNumber: vehicles.registrationNumber,
      fuelCost: sql<number>`COALESCE((SELECT SUM(CAST(cost AS NUMERIC)) FROM fuel_logs WHERE vehicle_id = vehicles.id), 0)`,
      maintenanceCost: sql<number>`COALESCE((SELECT SUM(CAST(cost AS NUMERIC)) FROM maintenance_logs WHERE vehicle_id = vehicles.id), 0)`,
    }).from(vehicles);

    data = result.map(r => ({
      Vehicle_ID: r.vehicleId,
      Registration_Number: r.registrationNumber,
      Fuel_Cost: r.fuelCost,
      Maintenance_Cost: r.maintenanceCost,
      Total_Cost: Number(r.fuelCost) + Number(r.maintenanceCost)
    }));

  } else if (type === 'vehicle-roi') {
    const costQuery = await db.select({
      vehicleId: vehicles.id,
      registrationNumber: vehicles.registrationNumber,
      acquisitionCost: vehicles.acquisitionCost,
      fuelCost: sql<number>`COALESCE((SELECT SUM(CAST(cost AS NUMERIC)) FROM fuel_logs WHERE vehicle_id = vehicles.id), 0)`,
      maintenanceCost: sql<number>`COALESCE((SELECT SUM(CAST(cost AS NUMERIC)) FROM maintenance_logs WHERE vehicle_id = vehicles.id), 0)`,
      revenue: sql<number>`COALESCE((SELECT SUM(CAST(revenue AS NUMERIC)) FROM trips WHERE vehicle_id = vehicles.id), 0)`
    }).from(vehicles);
    
    data = costQuery.map(r => {
      const acqCost = parseFloat(r.acquisitionCost as string) || 1;
      const totalCost = Number(r.fuelCost) + Number(r.maintenanceCost);
      const revenue = Number(r.revenue);
      const roi = (revenue - totalCost) / acqCost;
      return {
        Vehicle_ID: r.vehicleId,
        Registration_Number: r.registrationNumber,
        Acquisition_Cost: acqCost,
        Total_Cost: totalCost,
        Revenue: revenue,
        ROI: parseFloat(roi.toFixed(2))
      };
    });
  } else {
    return res.status(400).json(successResponse({ message: 'Invalid report type' }));
  }

  if (data.length === 0) {
    return res.status(404).send('No data available');
  }

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const csv = [headers, ...rows].join('\\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
  
  return res.send(csv);
});
