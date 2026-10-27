import prisma from "../../config/prisma";

import type {
  CreateOrderInput,
} from "./order.validation";

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

export const createOrder = async (
  userId: number,
  data: CreateOrderInput,
) => {
  /*
  |--------------------------------------------------------------------------
  | VERIFY ADDRESS
  |--------------------------------------------------------------------------
  */

  const address =
    await prisma.address.findFirst({
      where: {
        id: data.addressId,
        userId,
        deletedAt: null,
      },
    });

  if (!address) {
    throw new Error(
      "Address not found",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VERIFY PRODUCTS
  |--------------------------------------------------------------------------
  */

  const productIds =
    data.items.map(
      (item) => item.productId,
    );

  const products =
    await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },

        isActive: true,

        deletedAt: null,
      },

      include: {
        variants: true,
      },
    });

  if (
    products.length !==
    new Set(productIds).size
  ) {
    throw new Error(
      "One or more products were not found or are inactive",
    );
  }

  const productMap =
    new Map(
      products.map(
        (product) => [
          product.id,
          product,
        ],
      ),
    );

  /*
  |--------------------------------------------------------------------------
  | GENERATE ORDER NUMBER
  |--------------------------------------------------------------------------
  */

  const orderNumber =
    `ORD-${Date.now()}-${Math.floor(
      Math.random() * 10000,
    )
      .toString()
      .padStart(4, "0")}`;

  /*
  |--------------------------------------------------------------------------
  | CREATE ORDER TRANSACTION
  |--------------------------------------------------------------------------
  */

  const order =
    await prisma.$transaction(
      async (tx) => {
        let total = 0;

        const orderItems: {
          productId: number;
          variantId: number;
          quantity: number;
          price:
            typeof products[number]["price"];
        }[] = [];

        /*
        |--------------------------------------------------------------------------
        | VALIDATE EXACT VARIANTS + STOCK
        |--------------------------------------------------------------------------
        */

        for (
          const item of data.items
        ) {
          const product =
            productMap.get(
              item.productId,
            );

          if (!product) {
            throw new Error(
              `Product ${item.productId} not found`,
            );
          }

          if (
            product.variants.length ===
            0
          ) {
            throw new Error(
              `${product.name} has no inventory variant configured`,
            );
          }

          const variant =
            product.variants.find(
              (itemVariant) =>
                itemVariant.id ===
                item.variantId,
            );

          if (!variant) {
            throw new Error(
              `Selected variant ${item.variantId} does not belong to ${product.name}`,
            );
          }

          /*
          |--------------------------------------------------------------------------
          | CHECK EXACT VARIANT STOCK
          |--------------------------------------------------------------------------
          */

          if (
            variant.stock <=
            0
          ) {
            throw new Error(
              `${product.name} (${variant.name}: ${variant.value}) is out of stock`,
            );
          }

          if (
            variant.stock <
            item.quantity
          ) {
            throw new Error(
              `Insufficient stock for ${product.name} (${variant.name}: ${variant.value}). Available: ${variant.stock}, requested: ${item.quantity}`,
            );
          }

          /*
          |--------------------------------------------------------------------------
          | VALIDATE PRICE
          |--------------------------------------------------------------------------
          */

          const price =
            Number(
              product.price,
            );

          if (
            !Number.isFinite(
              price,
            ) ||
            price < 0
          ) {
            throw new Error(
              `Invalid price for ${product.name}`,
            );
          }

          total +=
            price *
            item.quantity;

          orderItems.push({
            productId:
              product.id,

            variantId:
              variant.id,

            quantity:
              item.quantity,

            price:
              product.price,
          });
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE ORDER + PAYMENT
        |--------------------------------------------------------------------------
        */

        const createdOrder =
          await tx.order.create({
            data: {
              orderNumber,

              total,

              status:
                "PENDING",

              userId,

              shippingLabel:
                address.label,

              shippingStreet:
                address.street,

              shippingCity:
                address.city,

              shippingRegion:
                address.region,

              shippingPostalCode:
                address.postalCode,

              shippingCountry:
                address.country,

              items: {
                create:
                  orderItems,
              },

              payment: {
                create: {
                  amount:
                    total,

                  method:
                    data.paymentMethod,

                  status:
                    "PENDING",
                },
              },
            },

            include: {
              items: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },

                  variant: true,
                },
              },

              payment: true,
            },
          });

        /*
        |--------------------------------------------------------------------------
        | REDUCE EXACT VARIANT INVENTORY
        |--------------------------------------------------------------------------
        */

        for (
          const item of data.items
        ) {
          const updatedVariant =
            await tx.productVariant.updateMany(
              {
                where: {
                  id:
                    item.variantId,

                  productId:
                    item.productId,

                  stock: {
                    gte:
                      item.quantity,
                  },
                },

                data: {
                  stock: {
                    decrement:
                      item.quantity,
                  },
                },
              },
            );

          /*
          |--------------------------------------------------------------------------
          | CONCURRENCY PROTECTION
          |--------------------------------------------------------------------------
          */

          if (
            updatedVariant.count !==
            1
          ) {
            throw new Error(
              `Unable to reserve stock for variant ${item.variantId}. The stock may have changed.`,
            );
          }

          /*
          |--------------------------------------------------------------------------
          | CREATE INVENTORY MOVEMENT
          |--------------------------------------------------------------------------
          */

          await tx.inventoryMovement.create({
            data: {
              quantity:
                item.quantity,

              type:
                "SALE",

              note:
                `Order ${createdOrder.orderNumber}`,

              variantId:
                item.variantId,
            },
          });
        }

        return createdOrder;
      },
    );

  return order;
};

/*
|--------------------------------------------------------------------------
| GET MY ORDERS
|--------------------------------------------------------------------------
*/

export const getMyOrders = async (
  userId: number,
) => {
  return prisma.order.findMany({
    where: {
      userId,

      deletedAt:
        null,
    },

    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },

          variant: true,
        },
      },

      payment: true,
    },

    orderBy: {
      createdAt:
        "desc",
    },
  });
};

/*
|--------------------------------------------------------------------------
| GET ORDER BY ID
|--------------------------------------------------------------------------
*/

export const getOrderById = async (
  userId: number,
  orderId: number,
) => {
  const order =
    await prisma.order.findFirst({
      where: {
        id: orderId,

        userId,

        deletedAt:
          null,
      },

      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },

            variant: true,
          },
        },

        payment: true,
      },
    });

  if (!order) {
    throw new Error(
      "Order not found",
    );
  }

  return order;
};