"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const variantSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "Variant name is required")
        .max(100),
    value: zod_1.z
        .string()
        .trim()
        .min(1, "Variant value is required")
        .max(100),
    sku: zod_1.z
        .string()
        .trim()
        .min(1, "Variant SKU is required")
        .max(100),
    stock: zod_1.z
        .number()
        .int()
        .min(0, "Stock cannot be negative"),
});
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Product name must be at least 2 characters")
        .max(200),
    slug: zod_1.z
        .string()
        .trim()
        .min(2, "Slug is required")
        .max(200)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    description: zod_1.z
        .string()
        .trim()
        .min(1, "Description is required"),
    sku: zod_1.z
        .string()
        .trim()
        .min(1, "SKU is required")
        .max(100),
    categoryId: zod_1.z
        .number()
        .int()
        .positive(),
    brandId: zod_1.z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),
    price: zod_1.z
        .number()
        .positive("Price must be greater than zero"),
    costPrice: zod_1.z
        .number()
        .positive("Cost price must be greater than zero")
        .nullable()
        .optional(),
    isFeatured: zod_1.z
        .boolean()
        .optional()
        .default(false),
    isActive: zod_1.z
        .boolean()
        .optional()
        .default(true),
    variants: zod_1.z
        .array(variantSchema)
        .optional()
        .default([]),
});
exports.updateProductSchema = exports.createProductSchema.partial();
