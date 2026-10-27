import prisma from "../../../config/prisma";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.validation";

export async function getCategories() {
  return prisma.category.findMany({
    where: {
      deletedAt: null,
    },

    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCategoryById(
  id: number,
) {
  const category =
    await prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      include: {
        products: {
          where: {
            deletedAt: null,
          },

          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            price: true,
          },
        },

        _count: {
          select: {
            products: true,
          },
        },
      },
    });

  if (!category) {
    throw new Error(
      "Category not found",
    );
  }

  return category;
}

export async function createCategory(
  data: CreateCategoryInput,
) {
  const existingCategory =
    await prisma.category.findFirst({
      where: {
        OR: [
          {
            name: data.name,
          },
          {
            slug: data.slug,
          },
        ],
      },
    });

  if (existingCategory) {
    if (
      existingCategory.name.toLowerCase() ===
      data.name.toLowerCase()
    ) {
      throw new Error(
        "A category with this name already exists",
      );
    }

    if (
      existingCategory.slug ===
      data.slug
    ) {
      throw new Error(
        "A category with this slug already exists",
      );
    }
  }

  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description:
        data.description,
    },
  });
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryInput,
) {
  const existingCategory =
    await prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

  if (!existingCategory) {
    throw new Error(
      "Category not found",
    );
  }

  if (
    data.name !== undefined &&
    data.name.toLowerCase() !==
      existingCategory.name.toLowerCase()
  ) {
    const duplicateName =
      await prisma.category.findFirst({
        where: {
          id: {
            not: id,
          },

          name: data.name,

          deletedAt: null,
        },
      });

    if (duplicateName) {
      throw new Error(
        "A category with this name already exists",
      );
    }
  }

  if (
    data.slug !== undefined &&
    data.slug !==
      existingCategory.slug
  ) {
    const duplicateSlug =
      await prisma.category.findFirst({
        where: {
          id: {
            not: id,
          },

          slug: data.slug,

          deletedAt: null,
        },
      });

    if (duplicateSlug) {
      throw new Error(
        "A category with this slug already exists",
      );
    }
  }

  const updateData: {
    name?: string;
    slug?: string;
    description?: string;
  } = {};

  if (
    data.name !== undefined
  ) {
    updateData.name =
      data.name;
  }

  if (
    data.slug !== undefined
  ) {
    updateData.slug =
      data.slug;
  }

  if (
    data.description !==
    undefined
  ) {
    updateData.description =
      data.description;
  }

  return prisma.category.update({
    where: {
      id,
    },

    data: updateData,
  });
}

export async function deleteCategory(
  id: number,
) {
  const category =
    await prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      include: {
        products: {
          where: {
            deletedAt: null,
          },

          select: {
            id: true,
          },

          take: 1,
        },
      },
    });

  if (!category) {
    throw new Error(
      "Category not found",
    );
  }

  if (
    category.products.length > 0
  ) {
    throw new Error(
      "Cannot delete a category that still contains active products",
    );
  }

  return prisma.category.update({
    where: {
      id,
    },

    data: {
      deletedAt: new Date(),
    },
  });
}