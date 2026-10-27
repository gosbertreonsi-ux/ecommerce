import prisma from "../../config/prisma";

import type {
  CreateReviewInput,
} from "./review.validation";

/*
|--------------------------------------------------------------------------
| CREATE REVIEW
|--------------------------------------------------------------------------
*/

export const createReview = async (
  userId: number,
  data: CreateReviewInput,
) => {
  /*
  |--------------------------------------------------------------------------
  | VERIFY ORDER
  |--------------------------------------------------------------------------
  */

  const order =
    await prisma.order.findFirst({
      where: {
        id: data.orderId,
        userId,
        deletedAt: null,
      },
      include: {
        items: {
          where: {
            deletedAt: null,
          },
          select: {
            productId: true,
          },
        },
      },
    });

  if (!order) {
    throw new Error(
      "Order not found",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ONLY DELIVERED ORDERS CAN BE REVIEWED
  |--------------------------------------------------------------------------
  */

  if (
    order.status !==
    "DELIVERED"
  ) {
    throw new Error(
      "You can only review products from delivered orders",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VERIFY PRODUCT BELONGS TO ORDER
  |--------------------------------------------------------------------------
  */

  const purchasedProduct =
    order.items.some(
      (item) =>
        item.productId ===
        data.productId,
    );

  if (!purchasedProduct) {
    throw new Error(
      "You can only review products from this order",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK EXISTING REVIEW
  |--------------------------------------------------------------------------
  */

  const existingReview =
    await prisma.review.findFirst({
      where: {
        userId,
        productId:
          data.productId,
        deletedAt: null,
      },
    });

  if (existingReview) {
    throw new Error(
      "You have already reviewed this product",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VERIFY PRODUCT
  |--------------------------------------------------------------------------
  */

  const product =
    await prisma.product.findFirst({
      where: {
        id: data.productId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

  if (!product) {
    throw new Error(
      "Product not found",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CREATE REVIEW
  |--------------------------------------------------------------------------
  */

  return prisma.review.create({
    data: {
      rating:
        data.rating,

      comment:
        data.comment
          ?.trim() || null,

      status:
        "PENDING",

      userId,

      productId:
        data.productId,
    },

    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          slug: true,
        },
      },
    },
  });
};

/*
|--------------------------------------------------------------------------
| GET MY REVIEWS
|--------------------------------------------------------------------------
*/

export const getMyReviews = async (
  userId: number,
) => {
  return prisma.review.findMany({
    where: {
      userId,
      deletedAt: null,
    },

    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          slug: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};