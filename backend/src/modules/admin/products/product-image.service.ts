import prisma from "../../../config/prisma";
import {
  deleteManagedCloudImage,
  managedImagePublicId,
  uploadProductImage,
  type CloudImage,
} from "../../../config/cloudinary";

const getProduct = (productId: number) =>
  prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });

// ==============================
// Upload to Cloudinary, then save secure URLs in the existing ProductImage table.
// No database schema change or storefront change is required.
// ==============================
export const addImages = async (
  productId: number,
  files: Express.Multer.File[],
) => {
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
    // Sequential uploading lowers peak memory usage on small free-tier servers.
    for (const file of files) {
      uploaded.push(await uploadProductImage(file));
    }

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
    // Remove cloud assets if an upload or DB write fails halfway through.
    const results = await Promise.allSettled(
      uploaded.map((image) => deleteManagedCloudImage(image.publicId)),
    );
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Unable to clean up Cloudinary asset:", result.reason);
      }
    }
    throw error;
  }
};

// ==============================
// Update image metadata (unchanged contract)
// ==============================
export const updateImage = async (
  productId: number,
  imageId: number,
  data: { altText?: string; displayOrder?: number },
) => {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) throw new Error("Product image not found");

  return prisma.productImage.update({ where: { id: imageId }, data });
};

// ==============================
// Delete database image, promote next primary, then clean up cloud storage.
// Legacy placeholder and old local-disk URLs are not destroyed in Cloudinary.
// ==============================
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
        await tx.productImage.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }
  });

  const publicId = managedImagePublicId(image.imageUrl);
  if (publicId) {
    try {
      await deleteManagedCloudImage(publicId);
    } catch (error) {
      // DB state remains correct; this cloud object may require manual cleanup.
      console.error("Unable to remove Cloudinary image:", error);
    }
  }

  return { message: "Product image deleted successfully" };
};

// ==============================
// Set one image as primary (unchanged contract)
// ==============================
export const setPrimaryImage = async (productId: number, imageId: number) => {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) throw new Error("Product image not found");

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    }),
    prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    }),
  ]);

  return prisma.productImage.findUnique({ where: { id: imageId } });
};
