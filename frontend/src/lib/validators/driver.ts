import { z } from "zod";

export const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseCategory: z.string().min(1, "Category is required"),
  licenseExpiryDate: z.string().min(1, "Expiry date is required"),
  contactNumber: z.string().min(1, "Contact is required"),
  status: z.enum(["available", "on_trip", "off_duty", "suspended"]).default("available"),
});

export type DriverFormData = z.infer<typeof driverSchema>;
