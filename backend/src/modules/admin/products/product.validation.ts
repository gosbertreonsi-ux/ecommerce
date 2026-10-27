import { z } from "zod";

const variantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Variant name is required")
    .max(100),

  value: z
    .string()
    .trim()
    .min(1, "Variant value is required")
    .max(100),

  sku: z
    .string()
    .trim()
    .min(1, "Variant SKU is required")
    .max(100),

  stock: z
    .number()
    .int()
    .min(0, "Stock cannot be negative"),
});

export const createProductSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .max(200),

    slug: z
      .string()
      .trim()
      .min(2, "Slug is required")
      .max(200)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),

    description: z
      .string()
      .trim()
      .min(1, "Description is required"),

    sku: z
      .string()
      .trim()
      .min(1, "SKU is required")
      .max(100),

    categoryId: z
      .number()
      .int()
      .positive(),

    brandId: z
      .number()
      .int()
      .positive()
      .nullable()
      .optional(),

    price: z
      .number()
      .positive("Price must be greater than zero"),

    costPrice: z
      .number()
      .positive("Cost price must be greater than zero")
      .nullable()
      .optional(),

    isFeatured: z
      .boolean()
      .optional()
      .default(false),

    isActive: z
      .boolean()
      .optional()
      .default(true),

    variants: z
      .array(variantSchema)
      .optional()
      .default([]),
  });

export const updateProductSchema =
  createProductSchema.partial();

export type CreateProductInput =
  z.infer<
    typeof createProductSchema
  >;

export type UpdateProductInput =
  z.infer<
    typeof updateProductSchema
  >;