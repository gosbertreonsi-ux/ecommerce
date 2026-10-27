import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z
    .number()
    .int()
    .positive(),

  method: z.enum([
    "CASH",
    "CARD",
    "MOBILE_MONEY",
  ]),
});

export const updatePaymentStatusSchema =
  z.object({
    status: z.enum([
      "PENDING",
      "SUCCESS",
      "FAILED",
      "REFUNDED",
    ]),

    transactionId: z
      .string()
      .trim()
      .min(1)
      .optional()
      .nullable(),
  });

export type CreatePaymentInput =
  z.infer<
    typeof createPaymentSchema
  >;

export type UpdatePaymentStatusInput =
  z.infer<
    typeof updatePaymentStatusSchema
  >;
