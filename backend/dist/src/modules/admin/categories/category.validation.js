"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
const categoryNameSchema = zod_1.z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters");
const categorySlugSchema = zod_1.z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens");
const categoryDescriptionSchema = zod_1.z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .nullable()
    .optional()
    .transform((value) => value ?? "");
exports.createCategorySchema = zod_1.z.object({
    name: categoryNameSchema,
    slug: categorySlugSchema,
    description: categoryDescriptionSchema,
});
exports.updateCategorySchema = zod_1.z.object({
    name: categoryNameSchema.optional(),
    slug: categorySlugSchema.optional(),
    description: categoryDescriptionSchema.optional(),
});
