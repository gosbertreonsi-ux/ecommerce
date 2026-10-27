"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryQuerySchema = exports.adjustInventorySchema = void 0;
const zod_1 = require("zod");
exports.adjustInventorySchema = zod_1.z.object({
    variantId: zod_1.z
        .number()
        .int()
        .positive(),
    quantity: zod_1.z
        .number()
        .int()
        .positive(),
    type: zod_1.z.enum([
        "PURCHASE",
        "RETURN",
        "DAMAGE",
        "ADJUSTMENT",
    ]),
    note: zod_1.z
        .string()
        .trim()
        .max(500, "Note cannot exceed 500 characters")
        .optional()
        .nullable(),
});
exports.inventoryQuerySchema = zod_1.z.object({
    variantId: zod_1.z
        .coerce
        .number()
        .int()
        .positive()
        .optional(),
    type: zod_1.z
        .enum([
        "PURCHASE",
        "SALE",
        "RETURN",
        "DAMAGE",
        "ADJUSTMENT",
    ])
        .optional(),
});
