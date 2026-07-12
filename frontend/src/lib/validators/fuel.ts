import { z } from "zod";

export const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  liters: z.coerce.number().min(0.1, "Liters must be positive"),
  cost: z.coerce.number().min(0, "Cost must be positive"),
  date: z.string().min(1, "Date is required"),
});

export type FuelLogFormData = z.infer<typeof fuelLogSchema>;
