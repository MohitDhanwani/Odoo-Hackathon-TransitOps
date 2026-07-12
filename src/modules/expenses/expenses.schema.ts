import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    type: z.string().min(1, 'Type is required'),
    amount: z.string().or(z.number()).transform((val) => String(val)),
    date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    description: z.string().optional().nullable(),
  }),
});
