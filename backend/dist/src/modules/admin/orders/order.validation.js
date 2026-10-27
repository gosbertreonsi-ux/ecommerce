"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderQuerySchema = exports.updateOrderStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "PENDING",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    ]),
});
exports.orderQuerySchema = zod_1.z.object({
    status: zod_1.z
        .enum([
        "PENDING",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    ])
        .optional(),
});
