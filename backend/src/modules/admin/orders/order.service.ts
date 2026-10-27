import prisma from "../../../config/prisma";

import type {
  OrderStatus,
} from "@prisma/client";

import type {
  OrderQueryInput,
  UpdateOrderStatusInput,
} from "./order.validation";

const orderInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },

  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          slug: true,
          price: true,

          images: {
            orderBy: {
              displayOrder:
                "asc" as const,
            },
          },
        },
      },

      variant: true,
    },
  },

  payment: true,
};

/*
|--------------------------------------------------------------------------
| GET ORDERS
|--------------------------------------------------------------------------
*/

export async function getOrders(
  query: OrderQueryInput,
) {
  return prisma.order.findMany({
    where: {
      deletedAt: null,

      ...(query.status
        ? {
            status: query.status,
          }
        : {}),
    },

    include:
      orderInclude,

    orderBy: {
      createdAt:
        "desc",
    },
  });
}

/*
|--------------------------------------------------------------------------
| GET ORDER BY ID
|--------------------------------------------------------------------------
*/

export async function getOrderById(
  id: number,
) {
  const order =
    await prisma.order.findFirst({
      where: {
        id,

        deletedAt:
          null,
      },

      include:
        orderInclude,
    });

  if (!order) {
    throw new Error(
      "Order not found",
    );
  }

  return order;
}

/*
|--------------------------------------------------------------------------
| ORDER STATUS TRANSITIONS
|--------------------------------------------------------------------------
*/

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  PENDING: [
    "PAID",
    "CANCELLED",
  ],

  PAID: [
    "PROCESSING",
    "CANCELLED",
  ],

  PROCESSING: [
    "SHIPPED",
    "CANCELLED",
  ],

  SHIPPED: [
    "DELIVERED",
  ],

  DELIVERED: [],

  CANCELLED: [],
};

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/

export async function updateOrderStatus(
  id: number,
  data: UpdateOrderStatusInput,
) {
  /*
  |--------------------------------------------------------------------------
  | FIND ORDER
  |--------------------------------------------------------------------------
  */

  const order =
    await prisma.order.findFirst({
      where: {
        id,

        deletedAt:
          null,
      },

      include: {
        payment: true,

        items: {
          include: {
            variant: true,
            product: true,
          },
        },
      },
    });

  if (!order) {
    throw new Error(
      "Order not found",
    );
  }

  const currentStatus =
    order.status;

  const newStatus =
    data.status;

  /*
  |--------------------------------------------------------------------------
  | SAME STATUS PROTECTION
  |--------------------------------------------------------------------------
  */

  if (
    currentStatus ===
    newStatus
  ) {
    throw new Error(
      `Order is already ${newStatus}`,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | TRANSITION VALIDATION
  |--------------------------------------------------------------------------
  */

  const allowed =
    allowedTransitions[
      currentStatus
    ];

  if (
    !allowed.includes(
      newStatus,
    )
  ) {
    throw new Error(
      `Cannot change order status from ${currentStatus} to ${newStatus}`,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAYMENT VALIDATION
  |--------------------------------------------------------------------------
  |
  | An order can only become PAID after its payment succeeds.
  |
  */

  if (
    newStatus ===
    "PAID"
  ) {
    if (!order.payment) {
      throw new Error(
        "Cannot mark order as PAID without a payment record",
      );
    }

    if (
      order.payment.status !==
      "SUCCESS"
    ) {
      throw new Error(
        "Order can only be marked as PAID after successful payment",
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | TRANSACTION
  |--------------------------------------------------------------------------
  */

  return prisma.$transaction(
    async (tx) => {
      /*
      |--------------------------------------------------------------------------
      | CANCEL ORDER
      |--------------------------------------------------------------------------
      |
      | Product variants reserve inventory when an order is created.
      |
      | For modern orders:
      |
      |   variantId exists
      |       ↓
      |   restore exact variant stock
      |       ↓
      |   create RETURN movement
      |
      | For historical orders:
      |
      |   variantId is null
      |       ↓
      |   allow cancellation
      |       ↓
      |   do NOT guess a variant
      |       ↓
      |   do NOT create an incorrect inventory movement
      |
      */

      if (
        newStatus ===
        "CANCELLED"
      ) {
        for (
          const item of order.items
        ) {
          /*
          |--------------------------------------------------------------------------
          | HISTORICAL ORDER
          |--------------------------------------------------------------------------
          |
          | Older orders may not have a variantId because variant tracking
          | was introduced later.
          |
          | We allow the cancellation, but we cannot safely restore inventory
          | because we do not know which variant originally supplied it.
          |
          */

          if (
            !item.variantId
          ) {
            continue;
          }

          /*
          |--------------------------------------------------------------------------
          | VERIFY VARIANT EXISTS
          |--------------------------------------------------------------------------
          */

          if (
            !item.variant
          ) {
            throw new Error(
              `Cannot cancel order ${order.orderNumber}: variant ${item.variantId} was not found`,
            );
          }

          /*
          |--------------------------------------------------------------------------
          | VERIFY VARIANT BELONGS TO PRODUCT
          |--------------------------------------------------------------------------
          */

          if (
            item.variant.productId !==
            item.productId
          ) {
            throw new Error(
              `Cannot cancel order ${order.orderNumber}: variant ${item.variantId} does not belong to product ${item.productId}`,
            );
          }

          /*
          |--------------------------------------------------------------------------
          | RESTORE EXACT VARIANT STOCK
          |--------------------------------------------------------------------------
          */

          await tx.productVariant.update({
            where: {
              id:
                item.variantId,
            },

            data: {
              stock: {
                increment:
                  item.quantity,
              },
            },
          });

          /*
          |--------------------------------------------------------------------------
          | CREATE RETURN INVENTORY MOVEMENT
          |--------------------------------------------------------------------------
          */

          await tx.inventoryMovement.create({
            data: {
              quantity:
                item.quantity,

              type:
                "RETURN",

              note:
                `Order ${order.orderNumber} cancelled`,

              variantId:
                item.variantId,
            },
          });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE ORDER STATUS
      |--------------------------------------------------------------------------
      */

      return tx.order.update({
        where: {
          id,
        },

        data: {
          status:
            newStatus,
        },

        include:
          orderInclude,
      });
    },
  );
}