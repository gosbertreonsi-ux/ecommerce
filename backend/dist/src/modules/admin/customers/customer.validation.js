"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerStatusSchema = exports.customerQuerySchema = void 0;
const zod_1 = require("zod");
exports.customerQuerySchema = zod_1.z.object({
    search: zod_1.z
        .string()
        .trim()
        .optional(),
});
exports.updateCustomerStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
