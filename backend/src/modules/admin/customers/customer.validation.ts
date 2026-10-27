import { z } from "zod";

export const customerQuerySchema =
  z.object({
    search: z
      .string()
      .trim()
      .optional(),
  });

export const updateCustomerStatusSchema =
  z.object({
    isActive: z.boolean(),
  });

export type CustomerQueryInput =
  z.infer<
    typeof customerQuerySchema
  >;

export type UpdateCustomerStatusInput =
  z.infer<
    typeof updateCustomerStatusSchema
  >;