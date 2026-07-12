import { z } from "zod";

export const expenseSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  type: z.string().min(1, "Type is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
