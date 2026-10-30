import prisma from "../../../config/prisma";
import {
  deleteManagedCloudImage,
  managedImagePublicId,
  uploadProductImage,
  type CloudImage,
} from "../../../config/cloudinary";

const getProduct = (productId: number) =>
  prisma.product.findFirst({ where: { id: productId, deletedAt: null } });

/** Decode and upload first, then write URLs to existing Neon ProductImage rows. */
export const addImages = async (productId: number, files: Express.Multer.File[]) => {
  const product = await getProduct(productId);
  if (!product) throw new Error("Product not found");
  if (!files.length) throw new Error("No images were uploaded");

  const lastImage = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { displayOrder: "desc" },
  });
  const primaryCount = await prisma.productImage.count({
    where: { productId, isPrimary: true },
  });

  const uploaded: CloudImage[] = [];
  try {
    // Sequential upload avoids high CPU usage on a free Render instance.
    for (const file of files) uploaded.push(await uploadProductImage(file));

    return await prisma.$transaction(
      uploaded.map((image, index) =>
        prisma.productImage.create({
          data: {
            imageUrl: image.url,
            altText: product.name,
            isPrimary: primaryCount === 0 && index === 0,
            displayOrder: (lastImage?.displayOrder ?? 0) + index + 1,
            productId,
          },
        }),
      ),
    );
  } catch (error) {
    console.error("[PRODUCT_IMAGE_UPLOAD_FAILED]", {
      productId,
      message: error instanceof Error ? error.message : "Unexpected upload error",
    });
    await Promise.allSettled(uploaded.map((image) => deleteManagedCloudImage(image.publicId)));
    throw error;
  }
};

export const updateImage = async (
  productId: number,
  imageId: number,
  data: { altText?: string; displayOrder?: number },
) => {
  const existing = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!existing) throw new Error("Product image not found");
  return prisma.productImage.update({ where: { id: imageId }, data });
};

/** Delete from Neon first, then clean up only app-owned Cloudinary assets. */
export const deleteImage = async (productId: number, imageId: number) => {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) throw new Error("Product image not found");

  await prisma.$transaction(async (tx) => {
    await tx.productImage.delete({ where: { id: imageId } });
    if (image.isPrimary) {
      const next = await tx.productImage.findFirst({
        where: { productId },
        orderBy: { displayOrder: "asc" },
      });
      if (next) {
        await tx.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    }
  });

  const publicId = managedImagePublicId(image.imageUrl);
  if (publicId) {
    try {
      await deleteManagedCloudImage(publicId);
    } catch (error) {
      console.error("Unable to remove Cloudinary image:", error);
    }
  }
  return { message: "Product image deleted successfully" };
};

export const setPrimaryImage = async (productId: number, imageId: number) => {
  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
  if (!image) throw new Error("Product image not found");

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId, isPrimary: true }, data: { isPrimary: false },
    }),
    prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);
  return prisma.productImage.findUnique({ where: { id: imageId } });
};
