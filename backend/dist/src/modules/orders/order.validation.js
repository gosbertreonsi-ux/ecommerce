"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    addressId: zod_1.z
        .number()
        .int()
        .positive(),
    paymentMethod: zod_1.z.enum([
        "CASH",
        "CARD",
        "MOBILE_MONEY",
    ]),
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z
            .number()
            .int()
            .positive(),
        variantId: zod_1.z
            .number()
            .int()
            .positive(),
        quantity: zod_1.z
            .number()
            .int()
            .positive(),
    }))
        .min(1)
        .superRefine((items, ctx) => {
        /*
        |------------------------------------------------------
        | DUPLICATE VARIANT CHECK
        |------------------------------------------------------
        |
        | A product may have multiple variants.
        |
        | Example:
        |
        | Product 10
        | ├── Variant 1 → Black / 128GB
        | ├── Variant 2 → Black / 256GB
        | └── Variant 3 → Blue / 256GB
        |
        | Variant 1 and Variant 2 are different order items.
        |
        | But the same variant must not appear twice.
        |
        */
        const variantKeys = new Set();
        items.forEach((item, index) => {
            const key = `${item.productId}:${item.variantId}`;
            if (variantKeys.has(key)) {
                ctx.addIssue({
                    code: "custom",
                    path: [
                        index,
                        "variantId",
                    ],
                    message: "Duplicate product variants are not allowed. Combine quantities into one item.",
                });
            }
            variantKeys.add(key);
        });
    }),
});
