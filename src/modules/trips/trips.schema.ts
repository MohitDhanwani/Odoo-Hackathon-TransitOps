import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    driverId: z.string().uuid('Invalid driver ID'),
    source: z.string().min(1, 'Source is required'),
    destination: z.string().min(1, 'Destination is required'),
    cargoWeight: z.string().or(z.number()).transform((val) => String(val)),
    plannedDistance: z.string().or(z.number()).transform((val) => String(val)),
    revenue: z.string().or(z.number()).transform((val) => String(val)).optional(),
  }),
});

export const completeTripSchema = z.object({
  body: z.object({
    actualDistance: z.string().or(z.number()).transform((val) => String(val)),
    fuelConsumed: z.string().or(z.number()).transform((val) => String(val)),
  }),
});
