import { z } from "zod";

const categoryNameSchema =
  z
    .string()
    .trim()
    .min(
      2,
      "Category name must be at least 2 characters",
    )
    .max(
      100,
      "Category name cannot exceed 100 characters",
    );

const categorySlugSchema =
  z
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
    );

const categoryDescriptionSchema =
  z
    .string()
    .trim()
    .max(
      500,
      "Description cannot exceed 500 characters",
    )
    .nullable()
    .optional()
    .transform(
      (value) => value ?? "",
    );

export const createCategorySchema =
  z.object({
    name: categoryNameSchema,

    slug: categorySlugSchema,

    description:
      categoryDescriptionSchema,
  });

export const updateCategorySchema =
  z.object({
    name:
      categoryNameSchema.optional(),

    slug:
      categorySlugSchema.optional(),

    description:
      categoryDescriptionSchema.optional(),
  });

export type CreateCategoryInput =
  z.infer<
    typeof createCategorySchema
  >;

export type UpdateCategoryInput =
  z.infer<
    typeof updateCategorySchema
  >;