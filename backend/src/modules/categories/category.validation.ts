import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name is required")
    .max(50),

  description: z
    .string()
    .trim()
    .max(255)
    .optional(),
});

export type CreateCategoryInput =
  z.infer<typeof createCategorySchema>;