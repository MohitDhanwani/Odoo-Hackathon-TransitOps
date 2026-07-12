import { db } from '../../config/db';
import { trips, vehicles, drivers } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { ApiError } from '../../utils/apiError';

export const tripsService = {
  async createDraft(data: any) {
    // 5. cargoWeight on a trip must not exceed the selected vehicle's maxLoadCapacity
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, data.vehicleId));
    if (!vehicle) throw new ApiError(404, 'Vehicle not found');

    if (parseFloat(data.cargoWeight) > parseFloat(vehicle.maxLoadCapacity)) {
      throw new ApiError(400, 'Cargo weight exceeds vehicle capacity');
    }

    const [driver] = await db.select().from(drivers).where(eq(drivers.id, data.driverId));
    if (!driver) throw new ApiError(404, 'Driver not found');

    const [trip] = await db.insert(trips).values({
      ...data,
      status: 'draft',
    }).returning();

    return trip;
  },

  async dispatch(tripId: string) {
    return await db.transaction(async (tx) => {
      const [trip] = await tx.select().from(trips).where(eq(trips.id, tripId));
      if (!trip) throw new ApiError(404, 'Trip not found');
      if (trip.status !== 'draft') throw new ApiError(400, 'Only draft trips can be dispatched');

      // 2. A vehicle with status retired or in_shop must never show up in the "available vehicles for dispatch" list.
      // 4. A vehicle or driver already on_trip cannot be assigned to another trip.
      const [vehicle] = await tx.select().from(vehicles).where(eq(vehicles.id, trip.vehicleId));
      if (vehicle.status !== 'available') {
        throw new ApiError(400, `Vehicle is not available for dispatch (status: ${vehicle.status})`);
      }

      // 3. A driver with status suspended, or whose licenseExpiryDate is in the past, must never show up
      // 4. A vehicle or driver already on_trip cannot be assigned to another trip.
      const [driver] = await tx.select().from(drivers).where(eq(drivers.id, trip.driverId));
      if (driver.status !== 'available') {
        throw new ApiError(400, `Driver is not available for dispatch (status: ${driver.status})`);
      }
      if (new Date(driver.licenseExpiryDate) < new Date()) {
        throw new ApiError(400, 'Driver license is expired');
      }

      // 6. Dispatching a trip sets both the vehicle and driver status to on_trip, and sets dispatchedAt
      await tx.update(vehicles).set({ status: 'on_trip' }).where(eq(vehicles.id, vehicle.id));
      await tx.update(drivers).set({ status: 'on_trip' }).where(eq(drivers.id, driver.id));

      const [updatedTrip] = await tx.update(trips)
        .set({ status: 'dispatched', dispatchedAt: new Date() })
        .where(eq(trips.id, tripId))
        .returning();

      return updatedTrip;
    });
  },

  async complete(tripId: string, actualDistance: string, fuelConsumed: string) {
    return await db.transaction(async (tx) => {
      const [trip] = await tx.select().from(trips).where(eq(trips.id, tripId));
      if (!trip) throw new ApiError(404, 'Trip not found');
      if (trip.status !== 'dispatched') throw new ApiError(400, 'Only dispatched trips can be completed');

      // 7. Completing a trip sets both vehicle and driver status back to available, and sets completedAt
      // updates vehicle's odometer (odometer += actualDistance)
      const newOdometer = sql`CAST(${vehicles.odometer} AS NUMERIC) + CAST(${actualDistance} AS NUMERIC)`;
      
      await tx.update(vehicles)
        .set({ status: 'available', odometer: newOdometer as any })
        .where(eq(vehicles.id, trip.vehicleId));

      await tx.update(drivers)
        .set({ status: 'available' })
        .where(eq(drivers.id, trip.driverId));

      const [updatedTrip] = await tx.update(trips)
        .set({ 
          status: 'completed', 
          completedAt: new Date(),
          actualDistance,
          fuelConsumed
        })
        .where(eq(trips.id, tripId))
        .returning();

      return updatedTrip;
    });
  },

  async cancel(tripId: string) {
    return await db.transaction(async (tx) => {
      const [trip] = await tx.select().from(trips).where(eq(trips.id, tripId));
      if (!trip) throw new ApiError(404, 'Trip not found');
      if (trip.status === 'completed' || trip.status === 'cancelled') {
        throw new ApiError(400, `Cannot cancel trip in ${trip.status} status`);
      }

      // 8. Cancelling a dispatched trip restores vehicle and driver to available.
      if (trip.status === 'dispatched') {
        await tx.update(vehicles).set({ status: 'available' }).where(eq(vehicles.id, trip.vehicleId));
        await tx.update(drivers).set({ status: 'available' }).where(eq(drivers.id, trip.driverId));
      }

      const [updatedTrip] = await tx.update(trips)
        .set({ status: 'cancelled', cancelledAt: new Date() })
        .where(eq(trips.id, tripId))
        .returning();

      return updatedTrip;
    });
  }
};
