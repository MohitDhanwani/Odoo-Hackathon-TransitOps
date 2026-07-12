import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    description: z.string().min(1, 'Description is required'),
    cost: z.string().or(z.number()).transform((val) => String(val)),
  }),
});
