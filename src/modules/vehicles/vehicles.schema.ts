import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    registrationNumber: z.string().min(1, 'Registration number is required'),
    name: z.string().min(1, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    maxLoadCapacity: z.string().or(z.number()).transform((val) => String(val)),
    odometer: z.string().or(z.number()).transform((val) => String(val)),
    acquisitionCost: z.string().or(z.number()).transform((val) => String(val)),
    region: z.string().optional().nullable(),
  }),
});

export const updateVehicleSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    maxLoadCapacity: z.string().or(z.number()).transform((val) => String(val)).optional(),
    odometer: z.string().or(z.number()).transform((val) => String(val)).optional(),
    acquisitionCost: z.string().or(z.number()).transform((val) => String(val)).optional(),
    region: z.string().optional().nullable(),
    status: z.enum(['available', 'on_trip', 'in_shop', 'retired']).optional(),
  }),
});
