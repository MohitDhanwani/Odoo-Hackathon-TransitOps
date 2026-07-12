import { db } from '../config/db';
import { users, vehicles, drivers, trips, roleEnum, vehicleStatusEnum, driverStatusEnum } from './schema';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('Starting seed...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const seedUsers = [
    { name: 'Fleet Manager 1', email: 'fleetmanager1@transitops.com', passwordHash, role: 'fleet_manager' as const },
    { name: 'Fleet Manager 2', email: 'fleetmanager2@transitops.com', passwordHash, role: 'fleet_manager' as const },
    { name: 'Dispatcher 1', email: 'dispatcher1@transitops.com', passwordHash, role: 'dispatcher' as const },
    { name: 'Dispatcher 2', email: 'dispatcher2@transitops.com', passwordHash, role: 'dispatcher' as const },
    { name: 'Safety Officer 1', email: 'safetyofficer1@transitops.com', passwordHash, role: 'safety_officer' as const },
    { name: 'Safety Officer 2', email: 'safetyofficer2@transitops.com', passwordHash, role: 'safety_officer' as const },
    { name: 'Financial Analyst 1', email: 'financialanalyst1@transitops.com', passwordHash, role: 'financial_analyst' as const },
    { name: 'Financial Analyst 2', email: 'financialanalyst2@transitops.com', passwordHash, role: 'financial_analyst' as const },
  ];

  const createdUsers = await db.insert(users).values(seedUsers).returning();

  console.log('\n--- Seed Users ---');
  for (const user of createdUsers) {
    console.log(`${user.role} | Email: ${user.email} | Password: password123`);
  }
  console.log('------------------\n');

  const seedVehicles = [
    { registrationNumber: 'TRK-1001', name: 'Volvo FH16', type: 'Truck', maxLoadCapacity: '20000', odometer: '150000', acquisitionCost: '120000', region: 'North', status: 'available' as const },
    { registrationNumber: 'VAN-2001', name: 'Ford Transit', type: 'Van', maxLoadCapacity: '2500', odometer: '55000', acquisitionCost: '35000', region: 'South', status: 'available' as const },
    { registrationNumber: 'TRK-1002', name: 'Scania R500', type: 'Truck', maxLoadCapacity: '18000', odometer: '80000', acquisitionCost: '110000', region: 'West', status: 'in_shop' as const },
  ];

  const createdVehicles = await db.insert(vehicles).values(seedVehicles).returning();
  console.log('Created vehicles.');

  const seedDrivers = [
    { name: 'John Doe', licenseNumber: 'DL-10001', licenseCategory: 'Heavy', licenseExpiryDate: '2026-12-31', contactNumber: '555-0101', safetyScore: '95', status: 'available' as const },
    { name: 'Jane Smith', licenseNumber: 'DL-20001', licenseCategory: 'Light', licenseExpiryDate: '2027-06-30', contactNumber: '555-0202', safetyScore: '100', status: 'available' as const },
    { name: 'Bob Johnson', licenseNumber: 'DL-30001', licenseCategory: 'Heavy', licenseExpiryDate: '2024-01-01', contactNumber: '555-0303', safetyScore: '70', status: 'suspended' as const },
  ];

  const createdDrivers = await db.insert(drivers).values(seedDrivers).returning();
  console.log('Created drivers.');

  // Create one trip
  const dispatcher = createdUsers.find(u => u.role === 'dispatcher');
  if (dispatcher && createdVehicles[0] && createdDrivers[0]) {
    await db.insert(trips).values({
      source: 'Warehouse A',
      destination: 'Client B',
      vehicleId: createdVehicles[0].id,
      driverId: createdDrivers[0].id,
      cargoWeight: '15000',
      plannedDistance: '350',
      status: 'draft',
      createdById: dispatcher.id,
      revenue: '1200',
    });
    console.log('Created sample trip.');
  }

  console.log('Seed completed successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
