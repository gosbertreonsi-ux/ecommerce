import fs from "fs/promises";
import path from "path";

import prisma from "../../../config/prisma";

const getProduct = async (
  productId: number,
) => {
  return prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
    },
  });
};

// ========================================
// Upload images
// ========================================

export const addImages = async (
  productId: number,
  files: Express.Multer.File[],
) => {
  const product =
    await getProduct(productId);

  if (!product) {
    throw new Error(
      "Product not found",
    );
  }

  if (!files.length) {
    throw new Error(
      "No images were uploaded",
    );
  }

  const existingImages =
    await prisma.productImage.findMany({
      where: {
        productId,
      },
      orderBy: {
        displayOrder: "desc",
      },
      take: 1,
    });

  const highestDisplayOrder =
    existingImages[0]
      ?.displayOrder ?? 0;

  const hasPrimaryImage =
    await prisma.productImage.count({
      where: {
        productId,
        isPrimary: true,
      },
    });

  const images =
    await prisma.$transaction(
      files.map(
        (file, index) =>
          prisma.productImage.create({
            data: {
              imageUrl:
                `/uploads/products/${file.filename}`,

              altText:
                product.name,

              isPrimary:
                hasPrimaryImage === 0 &&
                index === 0,

              displayOrder:
                highestDisplayOrder +
                index +
                1,

              productId,
            },
          }),
      ),
    );

  return images;
};

// ========================================
// Update image metadata
// ========================================

export const updateImage = async (
  productId: number,
  imageId: number,
  data: {
    altText?: string;
    displayOrder?: number;
  },
) => {
  const image =
    await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

  if (!image) {
    throw new Error(
      "Product image not found",
    );
  }

  return prisma.productImage.update({
    where: {
      id: imageId,
    },
    data,
  });
};

// ========================================
// Delete image
// ========================================

export const deleteImage = async (
  productId: number,
  imageId: number,
) => {
  const image =
    await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

  if (!image) {
    throw new Error(
      "Product image not found",
    );
  }

  await prisma.productImage.delete({
    where: {
      id: image.id,
    },
  });

  const filename =
    path.basename(
      image.imageUrl,
    );

  const filePath =
    path.resolve(
      process.cwd(),
      "uploads",
      "products",
      filename,
    );

  try {
    await fs.unlink(
      filePath,
    );
  } catch (error) {
    const fileError =
      error as NodeJS.ErrnoException;

    if (
      fileError.code !==
      "ENOENT"
    ) {
      console.error(
        "Failed to delete image file:",
        error,
      );
    }
  }

  // If the deleted image was primary,
  // promote the next image.
  if (image.isPrimary) {
    const nextImage =
      await prisma.productImage.findFirst(
        {
          where: {
            productId,
          },
          orderBy: {
            displayOrder:
              "asc",
          },
        },
      );

    if (nextImage) {
      await prisma.productImage.update({
        where: {
          id: nextImage.id,
        },
        data: {
          isPrimary: true,
        },
      });
    }
  }

  return {
    message:
      "Product image deleted successfully",
  };
};

// ========================================
// Set primary image
// ========================================

export const setPrimaryImage =
  async (
    productId: number,
    imageId: number,
  ) => {
    const image =
      await prisma.productImage.findFirst(
        {
          where: {
            id: imageId,
            productId,
          },
        },
      );

    if (!image) {
      throw new Error(
        "Product image not found",
      );
    }

    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: {
          productId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      }),

      prisma.productImage.update({
        where: {
          id: imageId,
        },
        data: {
          isPrimary: true,
        },
      }),
    ]);

    return prisma.productImage.findUnique({
      where: {
        id: imageId,
      },
    });
  };