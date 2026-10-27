import prisma from "../../config/prisma";

export async function getProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },

    include: {
      category: true,
      brand: true,

      images: {
        orderBy: {
          displayOrder: "asc",
        },
      },

      variants: true,

      reviews: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProductById(
  id: number,
) {
  return prisma.product.findFirst({
    where: {
      id,
      isActive: true,
      deletedAt: null,
    },

    include: {
      category: true,
      brand: true,

      images: {
        orderBy: {
          displayOrder: "asc",
        },
      },

      variants: true,

      reviews: true,
    },
  });
}