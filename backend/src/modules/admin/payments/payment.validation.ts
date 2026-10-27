import { z } from "zod";

export const updatePaymentStatusSchema =
  z.object({
    status: z.enum([
      "PENDING",
      "SUCCESS",
      "FAILED",
      "REFUNDED",
    ]),
  });

export const paymentQuerySchema =
  z.object({
    status: z
      .enum([
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUNDED",
      ])
      .optional(),

    method: z
      .enum([
        "CASH",
        "CARD",
        "MOBILE_MONEY",
      ])
      .optional(),
  });

export type UpdatePaymentStatusInput =
  z.infer<
    typeof updatePaymentStatusSchema
  >;

export type PaymentQueryInput =
  z.infer<
    typeof paymentQuerySchema
  >;