import prisma from "../../../config/prisma";

import type {
  CreateProductInput,
  UpdateProductInput,
} from "./product.validation";

const productInclude = {
  category: true,

  brand: true,

  images: {
    orderBy: {
      displayOrder: "asc" as const,
    },
  },

  variants: {
    orderBy: {
      id: "asc" as const,
    },
  },

  reviews: true,
};

export async function getProducts() {
  return prisma.product.findMany({
    where: {
      deletedAt: null,
    },

    include: productInclude,

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProductById(
  id: number,
) {
  const product =
    await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      include: productInclude,
    });

  if (!product) {
    throw new Error(
      "Product not found",
    );
  }

  return product;
}

export async function createProduct(
  data: CreateProductInput,
) {
  const existingProduct =
    await prisma.product.findFirst({
      where: {
        OR: [
          {
            slug: data.slug,
          },
          {
            sku: data.sku,
          },
        ],
        deletedAt: null,
      },
    });

  if (existingProduct) {
    if (
      existingProduct.slug ===
      data.slug
    ) {
      throw new Error(
        "A product with this slug already exists",
      );
    }

    if (
      existingProduct.sku ===
      data.sku
    ) {
      throw new Error(
        "A product with this SKU already exists",
      );
    }
  }

  if (data.variants.length > 0) {
    const variantSkus =
      data.variants.map(
        (variant) => variant.sku,
      );

    const uniqueVariantSkus =
      new Set(variantSkus);

    if (
      uniqueVariantSkus.size !==
      variantSkus.length
    ) {
      throw new Error(
        "Duplicate variant SKUs are not allowed",
      );
    }

    const existingVariant =
      await prisma.productVariant.findFirst(
        {
          where: {
            sku: {
              in: variantSkus,
            },
          },
        },
      );

    if (existingVariant) {
      throw new Error(
        `A variant with SKU ${existingVariant.sku} already exists`,
      );
    }
  }

  const category =
    await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        deletedAt: null,
      },
    });

  if (!category) {
    throw new Error(
      "Category not found",
    );
  }

  if (data.brandId) {
    const brand =
      await prisma.brand.findFirst({
        where: {
          id: data.brandId,
          isActive: true,
        },
      });

    if (!brand) {
      throw new Error(
        "Brand not found or inactive",
      );
    }
  }

  return prisma.$transaction(
    async (tx) => {
      const product =
        await tx.product.create({
          data: {
            name: data.name,
            slug: data.slug,
            description:
              data.description,
            sku: data.sku,
            categoryId:
              data.categoryId,
            brandId:
              data.brandId ?? null,
            price: data.price,
            costPrice:
              data.costPrice ?? null,
            isFeatured:
              data.isFeatured,
            isActive:
              data.isActive,

            variants: {
              create:
                data.variants.map(
                  (variant) => ({
                    name:
                      variant.name,
                    value:
                      variant.value,
                    sku:
                      variant.sku,
                    stock:
                      variant.stock,
                  }),
                ),
            },
          },

          include:
            productInclude,
        });

      return product;
    },
  );
}

export async function updateProduct(
  id: number,
  data: UpdateProductInput,
) {
  const existingProduct =
    await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },

      include: {
        variants: true,
      },
    });

  if (!existingProduct) {
    throw new Error(
      "Product not found",
    );
  }

  if (
    data.slug &&
    data.slug !== existingProduct.slug
  ) {
    const duplicateSlug =
      await prisma.product.findFirst({
        where: {
          slug: data.slug,
          id: {
            not: id,
          },
          deletedAt: null,
        },
      });

    if (duplicateSlug) {
      throw new Error(
        "A product with this slug already exists",
      );
    }
  }

  if (
    data.sku &&
    data.sku !== existingProduct.sku
  ) {
    const duplicateSku =
      await prisma.product.findFirst({
        where: {
          sku: data.sku,
          id: {
            not: id,
          },
          deletedAt: null,
        },
      });

    if (duplicateSku) {
      throw new Error(
        "A product with this SKU already exists",
      );
    }
  }

  if (
    data.categoryId !==
    undefined
  ) {
    const category =
      await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          deletedAt: null,
        },
      });

    if (!category) {
      throw new Error(
        "Category not found",
      );
    }
  }

  if (
    data.brandId !==
      undefined &&
    data.brandId !== null
  ) {
    const brand =
      await prisma.brand.findFirst({
        where: {
          id: data.brandId,
          isActive: true,
        },
      });

    if (!brand) {
      throw new Error(
        "Brand not found or inactive",
      );
    }
  }

  if (
    data.variants !==
    undefined
  ) {
    const variantSkus =
      data.variants.map(
        (variant) => variant.sku,
      );

    const uniqueVariantSkus =
      new Set(variantSkus);

    if (
      uniqueVariantSkus.size !==
      variantSkus.length
    ) {
      throw new Error(
        "Duplicate variant SKUs are not allowed",
      );
    }

    const existingVariant =
      await prisma.productVariant.findFirst(
        {
          where: {
            sku: {
              in: variantSkus,
            },

            id: {
              notIn:
                existingProduct.variants.map(
                  (variant) =>
                    variant.id,
                ),
            },
          },
        },
      );

    if (existingVariant) {
      throw new Error(
        `A variant with SKU ${existingVariant.sku} already exists`,
      );
    }
  }

  return prisma.$transaction(
    async (tx) => {
      const updateData: {
        name?: string;
        slug?: string;
        description?: string;
        sku?: string;
        categoryId?: number;
        brandId?: number | null;
        price?: number;
        costPrice?: number | null;
        isFeatured?: boolean;
        isActive?: boolean;
      } = {};

      if (
        data.name !==
        undefined
      ) {
        updateData.name =
          data.name;
      }

      if (
        data.slug !==
        undefined
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

      if (
        data.sku !==
        undefined
      ) {
        updateData.sku =
          data.sku;
      }

      if (
        data.categoryId !==
        undefined
      ) {
        updateData.categoryId =
          data.categoryId;
      }

      if (
        data.brandId !==
        undefined
      ) {
        updateData.brandId =
          data.brandId;
      }

      if (
        data.price !==
        undefined
      ) {
        updateData.price =
          data.price;
      }

      if (
        data.costPrice !==
        undefined
      ) {
        updateData.costPrice =
          data.costPrice;
      }

      if (
        data.isFeatured !==
        undefined
      ) {
        updateData.isFeatured =
          data.isFeatured;
      }

      if (
        data.isActive !==
        undefined
      ) {
        updateData.isActive =
          data.isActive;
      }

      await tx.product.update({
        where: {
          id,
        },

        data: updateData,
      });

      /*
       * Variant synchronization
       *
       * When variants are supplied, the submitted
       * array becomes the source of truth.
       *
       * Existing variants are updated.
       * New variants are created.
       * Missing old variants are deleted.
       */

      if (
        data.variants !==
        undefined
      ) {
        const submittedSkus =
          data.variants.map(
            (variant) => variant.sku,
          );

        const variantsToDelete =
          existingProduct.variants.filter(
            (variant) =>
              !submittedSkus.includes(
                variant.sku,
              ),
          );

        for (
          const variant of variantsToDelete
        ) {
          await tx.productVariant.delete({
            where: {
              id: variant.id,
            },
          });
        }

        for (
          const variant of data.variants
        ) {
          const existingVariant =
            existingProduct.variants.find(
              (item) =>
                item.sku ===
                variant.sku,
            );

          if (
            existingVariant
          ) {
            await tx.productVariant.update(
              {
                where: {
                  id:
                    existingVariant.id,
                },

                data: {
                  name:
                    variant.name,
                  value:
                    variant.value,
                  sku:
                    variant.sku,
                  stock:
                    variant.stock,
                },
              },
            );
          } else {
            await tx.productVariant.create(
              {
                data: {
                  name:
                    variant.name,
                  value:
                    variant.value,
                  sku:
                    variant.sku,
                  stock:
                    variant.stock,
                  productId:
                    id,
                },
              },
            );
          }
        }
      }

      return tx.product.findUnique({
        where: {
          id,
        },

        include:
          productInclude,
      });
    },
  );
}

export async function deleteProduct(
  id: number,
) {
  const product =
    await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

  if (!product) {
    throw new Error(
      "Product not found",
    );
  }

  const deletedAt =
    new Date();

  return prisma.product.update({
    where: {
      id,
    },

    data: {
      isActive: false,
      deletedAt,
    },
  });
}