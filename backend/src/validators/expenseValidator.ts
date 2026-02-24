import { z } from "zod";

export const createExpenseSchema = z.object({
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),

  amount: z
    .coerce
    .number()
    .positive({ message: "Amount must be greater than 0" }),

  vendorName: z
    .string()
    .trim()
    .min(1, { message: "Vendor name is required" }),

  description: z.string().optional(),
});