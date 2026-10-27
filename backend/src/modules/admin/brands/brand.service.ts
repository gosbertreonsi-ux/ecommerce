import prisma from "../../../config/prisma";

import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "./brand.validation";

export async function getBrands() {
  return prisma.brand.findMany({
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

export async function getBrandById(
  id: number,
) {
  const brand =
    await prisma.brand.findUnique({
      where: {
        id,
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
            isActive: true,
          },
        },

        _count: {
          select: {
            products: true,
          },
        },
      },
    });

  if (!brand) {
    throw new Error(
      "Brand not found",
    );
  }

  return brand;
}

export async function createBrand(
  data: CreateBrandInput,
) {
  const existingBrand =
    await prisma.brand.findFirst({
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

  if (existingBrand) {
    if (
      existingBrand.name.toLowerCase() ===
      data.name.toLowerCase()
    ) {
      throw new Error(
        "A brand with this name already exists",
      );
    }

    if (
      existingBrand.slug ===
      data.slug
    ) {
      throw new Error(
        "A brand with this slug already exists",
      );
    }
  }

  return prisma.brand.create({
    data: {
      name: data.name,
      slug: data.slug,
      isActive:
        data.isActive,
    },
  });
}

export async function updateBrand(
  id: number,
  data: UpdateBrandInput,
) {
  const existingBrand =
    await prisma.brand.findUnique({
      where: {
        id,
      },
    });

  if (!existingBrand) {
    throw new Error(
      "Brand not found",
    );
  }

  if (
    data.name !== undefined &&
    data.name.toLowerCase() !==
      existingBrand.name.toLowerCase()
  ) {
    const duplicateName =
      await prisma.brand.findFirst({
        where: {
          id: {
            not: id,
          },

          name: data.name,
        },
      });

    if (duplicateName) {
      throw new Error(
        "A brand with this name already exists",
      );
    }
  }

  if (
    data.slug !== undefined &&
    data.slug !==
      existingBrand.slug
  ) {
    const duplicateSlug =
      await prisma.brand.findFirst({
        where: {
          id: {
            not: id,
          },

          slug: data.slug,
        },
      });

    if (duplicateSlug) {
      throw new Error(
        "A brand with this slug already exists",
      );
    }
  }

  const updateData: {
    name?: string;
    slug?: string;
    isActive?: boolean;
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
    data.isActive !==
    undefined
  ) {
    updateData.isActive =
      data.isActive;
  }

  return prisma.brand.update({
    where: {
      id,
    },

    data: updateData,
  });
}

export async function deleteBrand(
  id: number,
) {
  const brand =
    await prisma.brand.findUnique({
      where: {
        id,
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

  if (!brand) {
    throw new Error(
      "Brand not found",
    );
  }

  if (
    brand.products.length > 0
  ) {
    throw new Error(
      "Cannot deactivate a brand that still has active products",
    );
  }

  return prisma.brand.update({
    where: {
      id,
    },

    data: {
      isActive: false,
    },
  });
}