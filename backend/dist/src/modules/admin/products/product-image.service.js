"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrimaryImage = exports.deleteImage = exports.updateImage = exports.addImages = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const cloudinary_1 = require("../../../config/cloudinary");
const getProduct = (productId) => prisma_1.default.product.findFirst({ where: { id: productId, deletedAt: null } });
/** Decode and upload first, then write URLs to existing Neon ProductImage rows. */
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
        // Sequential upload avoids high CPU usage on a free Render instance.
        for (const file of files)
            uploaded.push(await (0, cloudinary_1.uploadProductImage)(file));
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
        console.error("[PRODUCT_IMAGE_UPLOAD_FAILED]", {
            productId,
            message: error instanceof Error ? error.message : "Unexpected upload error",
        });
        await Promise.allSettled(uploaded.map((image) => (0, cloudinary_1.deleteManagedCloudImage)(image.publicId)));
        throw error;
    }
};
exports.addImages = addImages;
const updateImage = async (productId, imageId, data) => {
    const existing = await prisma_1.default.productImage.findFirst({
        where: { id: imageId, productId },
    });
    if (!existing)
        throw new Error("Product image not found");
    return prisma_1.default.productImage.update({ where: { id: imageId }, data });
};
exports.updateImage = updateImage;
/** Delete from Neon first, then clean up only app-owned Cloudinary assets. */
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
                await tx.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
            }
        }
    });
    const publicId = (0, cloudinary_1.managedImagePublicId)(image.imageUrl);
    if (publicId) {
        try {
            await (0, cloudinary_1.deleteManagedCloudImage)(publicId);
        }
        catch (error) {
            console.error("Unable to remove Cloudinary image:", error);
        }
    }
    return { message: "Product image deleted successfully" };
};
exports.deleteImage = deleteImage;
const setPrimaryImage = async (productId, imageId) => {
    const image = await prisma_1.default.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image)
        throw new Error("Product image not found");
    await prisma_1.default.$transaction([
        prisma_1.default.productImage.updateMany({
            where: { productId, isPrimary: true }, data: { isPrimary: false },
        }),
        prisma_1.default.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
    ]);
    return prisma_1.default.productImage.findUnique({ where: { id: imageId } });
};
exports.setPrimaryImage = setPrimaryImage;
