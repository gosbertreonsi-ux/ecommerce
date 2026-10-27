import { z } from "zod";

export const updateOrderStatusSchema =
  z.object({
    status: z.enum([
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ]),
  });

export const orderQuerySchema =
  z.object({
    status: z
      .enum([
        "PENDING",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ])
      .optional(),
  });

export type UpdateOrderStatusInput =
  z.infer<
    typeof updateOrderStatusSchema
  >;

export type OrderQueryInput =
  z.infer<
    typeof orderQuerySchema
  >;