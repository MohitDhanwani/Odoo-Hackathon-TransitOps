import { z } from "zod";

export const tripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().min(1, "Driver is required"),
  cargoWeight: z.coerce.number().min(0.1, "Cargo weight must be positive"),
  plannedDistance: z.coerce.number().min(0.1, "Planned distance must be positive"),
});

export type TripFormData = z.infer<typeof tripSchema>;

export const tripCompletionSchema = z.object({
  actualDistance: z.coerce.number().min(0.1, "Actual distance must be positive"),
  fuelConsumed: z.coerce.number().min(0.1, "Fuel consumed must be positive"),
});

export type TripCompletionFormData = z.infer<typeof tripCompletionSchema>;
