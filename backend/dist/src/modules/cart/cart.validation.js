"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemSchema = exports.addCartItemSchema = void 0;
const zod_1 = require("zod");
exports.addCartItemSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive(),
    variantId: zod_1.z.number().int().positive(),
    quantity: zod_1.z.number().int().positive(),
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().positive(),
});
