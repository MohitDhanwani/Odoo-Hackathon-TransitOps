import { z } from 'zod';

export const createDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    licenseNumber: z.string().min(1, 'License number is required'),
    licenseCategory: z.string().min(1, 'License category is required'),
    licenseExpiryDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    contactNumber: z.string().min(1, 'Contact number is required'),
    safetyScore: z.string().or(z.number()).transform((val) => String(val)).optional(),
  }),
});

export const updateDriverSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    licenseCategory: z.string().optional(),
    licenseExpiryDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    contactNumber: z.string().optional(),
    safetyScore: z.string().or(z.number()).transform((val) => String(val)).optional(),
    status: z.enum(['available', 'on_trip', 'off_duty', 'suspended']).optional(),
  }),
});
