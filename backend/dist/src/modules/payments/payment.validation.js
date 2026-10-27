"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    orderId: zod_1.z
        .number()
        .int()
        .positive(),
    method: zod_1.z.enum([
        "CASH",
        "CARD",
        "MOBILE_MONEY",
    ]),
});
exports.updatePaymentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUNDED",
    ]),
    transactionId: zod_1.z
        .string()
        .trim()
        .min(1)
        .optional()
        .nullable(),
});
