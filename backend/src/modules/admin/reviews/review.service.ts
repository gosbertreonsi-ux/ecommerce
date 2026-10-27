import prisma from "../../../config/prisma";

import type {
  ReviewQueryInput,
  UpdateReviewStatusInput,
} from "./review.validation";

const reviewInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },

  product: {
    select: {
      id: true,
      name: true,
      sku: true,
      slug: true,
      images: {
        orderBy: {
          displayOrder:
            "asc" as const,
        },
      },
    },
  },
};

export async function getReviews(
  query: ReviewQueryInput,
) {
  return prisma.review.findMany({
    where: {
      deletedAt: null,

      ...(query.status
        ? {
            status:
              query.status,
          }
        : {}),
    },

    include: reviewInclude,

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getReviewById(
  id: number,
) {
  const review =
    await prisma.review.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      include: reviewInclude,
    });

  if (!review) {
    throw new Error(
      "Review not found",
    );
  }

  return review;
}

export async function updateReviewStatus(
  id: number,
  data: UpdateReviewStatusInput,
) {
  const review =
    await prisma.review.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

  if (!review) {
    throw new Error(
      "Review not found",
    );
  }

  if (
    review.status ===
    data.status
  ) {
    throw new Error(
      `Review is already ${data.status}`,
    );
  }

  return prisma.review.update({
    where: {
      id,
    },

    data: {
      status:
        data.status,
    },

    include: reviewInclude,
  });
}

export async function deleteReview(
  id: number,
) {
  const review =
    await prisma.review.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

  if (!review) {
    throw new Error(
      "Review not found",
    );
  }

  return prisma.review.update({
    where: {
      id,
    },

    data: {
      deletedAt: new Date(),
    },

    include: reviewInclude,
  });
}