import { z } from "zod";

export const createBrandSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Brand name must be at least 2 characters",
      )
      .max(
        100,
        "Brand name cannot exceed 100 characters",
      ),

    slug: z
      .string()
      .trim()
      .min(
        2,
        "Slug is required",
      )
      .max(
        100,
        "Slug cannot exceed 100 characters",
      )
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),

    isActive: z
      .boolean()
      .optional()
      .default(true),
  });

export const updateBrandSchema =
  createBrandSchema.partial();

export type CreateBrandInput =
  z.infer<
    typeof createBrandSchema
  >;

export type UpdateBrandInput =
  z.infer<
    typeof updateBrandSchema
  >;