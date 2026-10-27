"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewStatusSchema = exports.reviewQuerySchema = void 0;
const zod_1 = require("zod");
exports.reviewQuerySchema = zod_1.z.object({
    status: zod_1.z
        .enum([
        "PENDING",
        "APPROVED",
        "REJECTED",
    ])
        .optional(),
});
exports.updateReviewStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "PENDING",
        "APPROVED",
        "REJECTED",
    ]),
});
