import { z } from "zod";

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  description: z.string().min(1, "Description is required"),
  cost: z.coerce.number().min(0, "Cost must be positive"),
});

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;
