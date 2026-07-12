import { z } from "zod";

export const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  name: z.string().min(1, "Vehicle name/model is required"),
  type: z.string().min(1, "Type is required"),
  maxLoadCapacity: z.coerce.number().min(0, "Capacity must be positive"),
  odometer: z.coerce.number().min(0, "Odometer must be positive"),
  acquisitionCost: z.coerce.number().min(0, "Cost must be positive"),
  region: z.string().optional(),
  status: z.enum(["available", "on_trip", "in_shop", "retired"]).default("available"),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
