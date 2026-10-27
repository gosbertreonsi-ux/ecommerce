"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentQuerySchema = exports.updatePaymentStatusSchema = void 0;
const zod_1 = require("zod");
exports.updatePaymentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUNDED",
    ]),
});
exports.paymentQuerySchema = zod_1.z.object({
    status: zod_1.z
        .enum([
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUNDED",
    ])
        .optional(),
    method: zod_1.z
        .enum([
        "CASH",
        "CARD",
        "MOBILE_MONEY",
    ])
        .optional(),
});
