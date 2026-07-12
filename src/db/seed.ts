import { db } from '../config/db';
import { users, vehicles, drivers, trips, maintenanceLogs, fuelLogs, expenses, roleEnum, vehicleStatusEnum, driverStatusEnum, tripStatusEnum } from './schema';
import * as bcrypt from 'bcrypt';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

async function seed() {
  console.log('Starting massive seed...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const seedUsers = [
    { name: 'Fleet Manager 1', email: 'fleetmanager1@transitops.com', passwordHash, role: 'fleet_manager' as const },
    { name: 'Dispatcher 1', email: 'dispatcher1@transitops.com', passwordHash, role: 'dispatcher' as const },
    { name: 'Safety Officer 1', email: 'safetyofficer1@transitops.com', passwordHash, role: 'safety_officer' as const },
    { name: 'Financial Analyst 1', email: 'financialanalyst1@transitops.com', passwordHash, role: 'financial_analyst' as const },
  ];

  await db.delete(expenses);
  await db.delete(fuelLogs);
  await db.delete(maintenanceLogs);
  await db.delete(trips);
  await db.delete(vehicles);
  await db.delete(drivers);
  await db.delete(users);

  const createdUsers = await db.insert(users).values(seedUsers).returning();
  console.log('Created 4 users.');

  const dispatcher = createdUsers.find(u => u.role === 'dispatcher')!;
  const fleetManager = createdUsers.find(u => u.role === 'fleet_manager')!;
  const financialAnalyst = createdUsers.find(u => u.role === 'financial_analyst')!;

  const vehicleModels = [
    { name: 'Volvo FH16', type: 'Truck', cap: 20000, cost: 120000 },
    { name: 'Scania R500', type: 'Truck', cap: 18000, cost: 110000 },
    { name: 'Ford Transit', type: 'Van', cap: 2500, cost: 35000 },
    { name: 'Mercedes Sprinter', type: 'Van', cap: 2800, cost: 42000 },
    { name: 'Toyota Hilux', type: 'Pickup', cap: 1000, cost: 28000 },
    { name: 'Isuzu NPR', type: 'Mini-Truck', cap: 5000, cost: 45000 }
  ];

  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const vStatuses = ['available', 'available', 'available', 'available', 'on_trip', 'on_trip', 'in_shop', 'in_shop', 'retired'] as const;

  const vehiclesToInsert = Array.from({ length: 15 }).map((_, i) => {
    const model = randomItem(vehicleModels);
    return {
      registrationNumber: `V-${1000 + i}`,
      name: model.name,
      type: model.type,
      maxLoadCapacity: model.cap.toString(),
      odometer: randomInt(10000, 200000).toString(),
      acquisitionCost: model.cost.toString(),
      region: randomItem(regions),
      status: randomItem(vStatuses)
    };
  });

  const createdVehicles = await db.insert(vehicles).values(vehiclesToInsert).returning();
  console.log(`Created ${createdVehicles.length} vehicles.`);

  const driverNames = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown', 'Diana Prince', 'Eve Davis', 'Frank Miller', 'Grace Hopper', 'Hank Pym', 'Ivy League', 'Jack Ryan', 'Karen Page', 'Leo Fitz', 'Mia Wallace'];
  const dStatuses = ['available', 'available', 'available', 'available', 'on_trip', 'on_trip', 'off_duty', 'suspended'] as const;

  const driversToInsert = Array.from({ length: 15 }).map((_, i) => {
    // 2 drivers will have expired licenses
    const isExpired = i < 2;
    const expiryYear = isExpired ? 2023 : randomInt(2025, 2030);
    const score = isExpired ? randomInt(40, 60) : randomInt(80, 100);
    
    return {
      name: driverNames[i],
      licenseNumber: `DL-${10000 + i}`,
      licenseCategory: randomItem(['Heavy', 'Light', 'Commercial']),
      licenseExpiryDate: `${expiryYear}-12-31`,
      contactNumber: `555-${1000 + i}`,
      safetyScore: score.toString(),
      status: randomItem(dStatuses)
    };
  });

  const createdDrivers = await db.insert(drivers).values(driversToInsert).returning();
  console.log(`Created ${createdDrivers.length} drivers.`);

  const cities = ['New York', 'Boston', 'Chicago', 'Miami', 'Dallas', 'Denver', 'Seattle', 'Los Angeles', 'San Francisco', 'Atlanta'];
  const tStatuses = ['draft', 'dispatched', 'dispatched', 'completed', 'completed', 'completed', 'cancelled'] as const;

  const tripsToInsert = Array.from({ length: 25 }).map(() => {
    const v = randomItem(createdVehicles);
    const d = randomItem(createdDrivers);
    const src = randomItem(cities);
    let dest = randomItem(cities);
    while (dest === src) dest = randomItem(cities);

    const plannedDist = randomInt(50, 1000);
    const status = randomItem(tStatuses);
    
    return {
      vehicleId: v.id,
      driverId: d.id,
      source: src,
      destination: dest,
      cargoWeight: randomInt(500, parseInt(v.maxLoadCapacity)).toString(),
      plannedDistance: plannedDist.toString(),
      actualDistance: status === 'completed' ? (plannedDist + randomInt(-20, 50)).toString() : null,
      fuelConsumed: status === 'completed' ? (plannedDist / randomInt(5, 10)).toFixed(1) : null,
      revenue: (plannedDist * randomInt(2, 5)).toString(),
      status,
      createdById: dispatcher.id
    };
  });

  const createdTrips = await db.insert(trips).values(tripsToInsert).returning();
  console.log(`Created ${createdTrips.length} trips.`);

  const maintenanceToInsert = Array.from({ length: 12 }).map(() => {
    const v = randomItem(createdVehicles);
    return {
      vehicleId: v.id,
      description: randomItem(['Oil Change', 'Brake Pad Replacement', 'Tire Rotation', 'Engine Tune-up', 'Transmission Flush']),
      cost: randomInt(150, 1500).toString(),
      createdById: fleetManager.id
    };
  });
  await db.insert(maintenanceLogs).values(maintenanceToInsert);
  console.log(`Created 12 maintenance logs.`);

  const fuelLogsToInsert = Array.from({ length: 18 }).map(() => {
    const v = randomItem(createdVehicles);
    const liters = randomInt(50, 200);
    return {
      vehicleId: v.id,
      date: new Date(Date.now() - randomInt(1, 30) * 86400000).toISOString(),
      liters: liters.toString(),
      cost: (liters * 1.15).toFixed(2),
      createdById: financialAnalyst.id
    };
  });
  await db.insert(fuelLogs).values(fuelLogsToInsert);
  console.log(`Created 18 fuel logs.`);

  const expensesToInsert = Array.from({ length: 15 }).map(() => {
    const v = randomItem(createdVehicles);
    return {
      vehicleId: v.id,
      date: new Date(Date.now() - randomInt(1, 30) * 86400000).toISOString(),
      type: randomItem(['Toll', 'Fine', 'Wash', 'Parking']),
      amount: randomInt(10, 150).toString(),
      description: 'Operational expense',
      createdById: financialAnalyst.id
    };
  });
  await db.insert(expenses).values(expensesToInsert);
  console.log(`Created 15 expenses.`);

  console.log('Seed completed successfully. ~90 rows generated.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
