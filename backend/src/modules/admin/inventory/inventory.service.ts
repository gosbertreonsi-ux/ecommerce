import prisma from "../../../config/prisma";

import type {
  AdjustInventoryInput,
  InventoryQueryInput,
} from "./inventory.validation";

export async function getInventory() {
  return prisma.productVariant.findMany({
    where: {
      product: {
        deletedAt: null,
      },
    },

    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          isActive: true,
          deletedAt: true,
        },
      },

      inventoryMovements: {
        orderBy: {
          createdAt: "desc",
        },

        take: 10,
      },
    },

    orderBy: {
      stock: "asc",
    },
  });
}

export async function getLowStockInventory(
  threshold = 5,
) {
  if (
    !Number.isInteger(threshold) ||
    threshold < 0
  ) {
    throw new Error(
      "Invalid stock threshold",
    );
  }

  return prisma.productVariant.findMany({
    where: {
      stock: {
        lte: threshold,
      },

      product: {
        deletedAt: null,
        isActive: true,
      },
    },

    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          isActive: true,
        },
      },
    },

    orderBy: {
      stock: "asc",
    },
  });
}

export async function getInventoryMovements(
  query: InventoryQueryInput,
) {
  return prisma.inventoryMovement.findMany({
    where: {
      ...(query.variantId
        ? {
            variantId:
              query.variantId,
          }
        : {}),

      ...(query.type
        ? {
            type: query.type,
          }
        : {}),
    },

    include: {
      variant: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function adjustInventory(
  data: AdjustInventoryInput,
) {
  const variant =
    await prisma.productVariant.findUnique({
      where: {
        id: data.variantId,
      },

      include: {
        product: true,
      },
    });

  if (!variant) {
    throw new Error(
      "Product variant not found",
    );
  }

  if (
    variant.product.deletedAt
  ) {
    throw new Error(
      "Cannot modify inventory for a deleted product",
    );
  }

  if (
    !variant.product.isActive
  ) {
    throw new Error(
      "Cannot modify inventory for an inactive product",
    );
  }

  const increasesStock =
    data.type === "PURCHASE" ||
    data.type === "RETURN";

  const decreasesStock =
    data.type === "DAMAGE";

  if (
    decreasesStock &&
    variant.stock < data.quantity
  ) {
    throw new Error(
      `Insufficient stock. Available: ${variant.stock}, requested: ${data.quantity}`,
    );
  }

  const newStock =
    increasesStock
      ? variant.stock +
        data.quantity
      : decreasesStock
        ? variant.stock -
          data.quantity
        : data.quantity;

  if (newStock < 0) {
    throw new Error(
      "Stock cannot be negative",
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const updatedVariant =
        await tx.productVariant.update({
          where: {
            id: data.variantId,
          },

          data: {
            stock: newStock,
          },

          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        });

      await tx.inventoryMovement.create({
        data: {
          quantity: data.quantity,
          type: data.type,
          note:
            data.note ??
            `Inventory ${data.type.toLowerCase()}`,
          variantId:
            data.variantId,
        },
      });

      return updatedVariant;
    },
  );
}