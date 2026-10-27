"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBrandSchema = exports.createBrandSchema = void 0;
const zod_1 = require("zod");
exports.createBrandSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Brand name must be at least 2 characters")
        .max(100, "Brand name cannot exceed 100 characters"),
    slug: zod_1.z
        .string()
        .trim()
        .min(2, "Slug is required")
        .max(100, "Slug cannot exceed 100 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    isActive: zod_1.z
        .boolean()
        .optional()
        .default(true),
});
exports.updateBrandSchema = exports.createBrandSchema.partial();
