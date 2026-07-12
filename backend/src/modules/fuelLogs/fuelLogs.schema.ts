import { z } from 'zod';

export const createFuelLogSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    tripId: z.string().uuid('Invalid trip ID').optional().nullable(),
    liters: z.string().or(z.number()).transform((val) => String(val)),
    cost: z.string().or(z.number()).transform((val) => String(val)),
    date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  }),
});
