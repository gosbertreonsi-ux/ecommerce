"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrimaryImage = exports.deleteImage = exports.updateImage = exports.addImages = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const cloudinary_1 = require("../../../config/cloudinary");
const getProduct = (productId) => prisma_1.default.product.findFirst({
    where: { id: productId, deletedAt: null },
});
// ==============================
// Upload to Cloudinary, then save secure URLs in the existing ProductImage table.
// No database schema change or storefront change is required.
// ==============================
const addImages = async (productId, files) => {
    const product = await getProduct(productId);
    if (!product)
        throw new Error("Product not found");
    if (!files.length)
        throw new Error("No images were uploaded");
    const lastImage = await prisma_1.default.productImage.findFirst({
        where: { productId },
        orderBy: { displayOrder: "desc" },
    });
    const primaryCount = await prisma_1.default.productImage.count({
        where: { productId, isPrimary: true },
    });
    const uploaded = [];
    try {
        // Sequential uploading lowers peak memory usage on small free-tier servers.
        for (const file of files) {
            uploaded.push(await (0, cloudinary_1.uploadProductImage)(file));
        }
        return await prisma_1.default.$transaction(uploaded.map((image, index) => prisma_1.default.productImage.create({
            data: {
                imageUrl: image.url,
                altText: product.name,
                isPrimary: primaryCount === 0 && index === 0,
                displayOrder: (lastImage?.displayOrder ?? 0) + index + 1,
                productId,
            },
        })));
    }
    catch (error) {
        // Remove cloud assets if an upload or DB write fails halfway through.
        const results = await Promise.allSettled(uploaded.map((image) => (0, cloudinary_1.deleteManagedCloudImage)(image.publicId)));
        for (const result of results) {
            if (result.status === "rejected") {
                console.error("Unable to clean up Cloudinary asset:", result.reason);
            }
        }
        throw error;
    }
};
exports.addImages = addImages;
// ==============================
// Update image metadata (unchanged contract)
// ==============================
const updateImage = async (productId, imageId, data) => {
    const image = await prisma_1.default.productImage.findFirst({
        where: { id: imageId, productId },
    });
    if (!image)
        throw new Error("Product image not found");
    return prisma_1.default.productImage.update({ where: { id: imageId }, data });
};
exports.updateImage = updateImage;
// ==============================
// Delete database image, promote next primary, then clean up cloud storage.
// Legacy placeholder and old local-disk URLs are not destroyed in Cloudinary.
// ==============================
const deleteImage = async (productId, imageId) => {
    const image = await prisma_1.default.productImage.findFirst({
        where: { id: imageId, productId },
    });
    if (!image)
        throw new Error("Product image not found");
    await prisma_1.default.$transaction(async (tx) => {
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
    const publicId = (0, cloudinary_1.managedImagePublicId)(image.imageUrl);
    if (publicId) {
        try {
            await (0, cloudinary_1.deleteManagedCloudImage)(publicId);
        }
        catch (error) {
            // DB state remains correct; this cloud object may require manual cleanup.
            console.error("Unable to remove Cloudinary image:", error);
        }
    }
    return { message: "Product image deleted successfully" };
};
exports.deleteImage = deleteImage;
// ==============================
// Set one image as primary (unchanged contract)
// ==============================
const setPrimaryImage = async (productId, imageId) => {
    const image = await prisma_1.default.productImage.findFirst({
        where: { id: imageId, productId },
    });
    if (!image)
        throw new Error("Product image not found");
    await prisma_1.default.$transaction([
        prisma_1.default.productImage.updateMany({
            where: { productId, isPrimary: true },
            data: { isPrimary: false },
        }),
        prisma_1.default.productImage.update({
            where: { id: imageId },
            data: { isPrimary: true },
        }),
    ]);
    return prisma_1.default.productImage.findUnique({ where: { id: imageId } });
};
exports.setPrimaryImage = setPrimaryImage;
