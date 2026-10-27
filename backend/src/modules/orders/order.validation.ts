import { z } from "zod";


export const createOrderSchema =
  z.object({
    addressId:
      z
        .number()
        .int()
        .positive(),

    paymentMethod:
      z.enum([
        "CASH",
        "CARD",
        "MOBILE_MONEY",
      ]),

    items:
      z
        .array(
          z.object({
            productId:
              z
                .number()
                .int()
                .positive(),

            variantId:
              z
                .number()
                .int()
                .positive(),

            quantity:
              z
                .number()
                .int()
                .positive(),
          }),
        )
        .min(1)
        .superRefine(
          (items, ctx) => {
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

            const variantKeys =
              new Set<string>();

            items.forEach(
              (item, index) => {
                const key =
                  `${item.productId}:${item.variantId}`;

                if (
                  variantKeys.has(
                    key,
                  )
                ) {
                  ctx.addIssue({
                    code: "custom",

                    path: [
                      index,
                      "variantId",
                    ],

                    message:
                      "Duplicate product variants are not allowed. Combine quantities into one item.",
                  });
                }

                variantKeys.add(
                  key,
                );
              },
            );
          },
        ),
  });


export type CreateOrderInput =
  z.infer<
    typeof createOrderSchema
  >;