import { z } from "zod";

export const adjustInventorySchema =
  z.object({
    variantId: z
      .number()
      .int()
      .positive(),

    quantity: z
      .number()
      .int()
      .positive(),

    type: z.enum([
      "PURCHASE",
      "RETURN",
      "DAMAGE",
      "ADJUSTMENT",
    ]),

    note: z
      .string()
      .trim()
      .max(
        500,
        "Note cannot exceed 500 characters",
      )
      .optional()
      .nullable(),
  });

export const inventoryQuerySchema =
  z.object({
    variantId: z
      .coerce
      .number()
      .int()
      .positive()
      .optional(),

    type: z
      .enum([
        "PURCHASE",
        "SALE",
        "RETURN",
        "DAMAGE",
        "ADJUSTMENT",
      ])
      .optional(),
  });

export type AdjustInventoryInput =
  z.infer<
    typeof adjustInventorySchema
  >;

export type InventoryQueryInput =
  z.infer<
    typeof inventoryQuerySchema
  >;