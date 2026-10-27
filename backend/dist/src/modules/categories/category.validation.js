"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Category name is required")
        .max(50),
    description: zod_1.z
        .string()
        .trim()
        .max(255)
        .optional(),
});
