import { z } from "zod";

export const reviewQuerySchema =
  z.object({
    status: z
      .enum([
        "PENDING",
        "APPROVED",
        "REJECTED",
      ])
      .optional(),
  });

export const updateReviewStatusSchema =
  z.object({
    status: z.enum([
      "PENDING",
      "APPROVED",
      "REJECTED",
    ]),
  });

export type ReviewQueryInput =
  z.infer<
    typeof reviewQuerySchema
  >;

export type UpdateReviewStatusInput =
  z.infer<
    typeof updateReviewStatusSchema
  >;