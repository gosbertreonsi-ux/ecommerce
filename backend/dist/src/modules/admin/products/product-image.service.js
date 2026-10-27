"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrimaryImage = exports.deleteImage = exports.updateImage = exports.addImages = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("../../../config/prisma"));
const getProduct = async (productId) => {
    return prisma_1.default.product.findFirst({
        where: {
            id: productId,
            deletedAt: null,
        },
    });
};
// ========================================
// Upload images
// ========================================
const addImages = async (productId, files) => {
    const product = await getProduct(productId);
    if (!product) {
        throw new Error("Product not found");
    }
    if (!files.length) {
        throw new Error("No images were uploaded");
    }
    const existingImages = await prisma_1.default.productImage.findMany({
        where: {
            productId,
        },
        orderBy: {
            displayOrder: "desc",
        },
        take: 1,
    });
    const highestDisplayOrder = existingImages[0]
        ?.displayOrder ?? 0;
    const hasPrimaryImage = await prisma_1.default.productImage.count({
        where: {
            productId,
            isPrimary: true,
        },
    });
    const images = await prisma_1.default.$transaction(files.map((file, index) => prisma_1.default.productImage.create({
        data: {
            imageUrl: `/uploads/products/${file.filename}`,
            altText: product.name,
            isPrimary: hasPrimaryImage === 0 &&
                index === 0,
            displayOrder: highestDisplayOrder +
                index +
                1,
            productId,
        },
    })));
    return images;
};
exports.addImages = addImages;
// ========================================
// Update image metadata
// ========================================
const updateImage = async (productId, imageId, data) => {
    const image = await prisma_1.default.productImage.findFirst({
        where: {
            id: imageId,
            productId,
        },
    });
    if (!image) {
        throw new Error("Product image not found");
    }
    return prisma_1.default.productImage.update({
        where: {
            id: imageId,
        },
        data,
    });
};
exports.updateImage = updateImage;
// ========================================
// Delete image
// ========================================
const deleteImage = async (productId, imageId) => {
    const image = await prisma_1.default.productImage.findFirst({
        where: {
            id: imageId,
            productId,
        },
    });
    if (!image) {
        throw new Error("Product image not found");
    }
    await prisma_1.default.productImage.delete({
        where: {
            id: image.id,
        },
    });
    const filename = path_1.default.basename(image.imageUrl);
    const filePath = path_1.default.resolve(process.cwd(), "uploads", "products", filename);
    try {
        await promises_1.default.unlink(filePath);
    }
    catch (error) {
        const fileError = error;
        if (fileError.code !==
            "ENOENT") {
            console.error("Failed to delete image file:", error);
        }
    }
    // If the deleted image was primary,
    // promote the next image.
    if (image.isPrimary) {
        const nextImage = await prisma_1.default.productImage.findFirst({
            where: {
                productId,
            },
            orderBy: {
                displayOrder: "asc",
            },
        });
        if (nextImage) {
            await prisma_1.default.productImage.update({
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
        message: "Product image deleted successfully",
    };
};
exports.deleteImage = deleteImage;
// ========================================
// Set primary image
// ========================================
const setPrimaryImage = async (productId, imageId) => {
    const image = await prisma_1.default.productImage.findFirst({
        where: {
            id: imageId,
            productId,
        },
    });
    if (!image) {
        throw new Error("Product image not found");
    }
    await prisma_1.default.$transaction([
        prisma_1.default.productImage.updateMany({
            where: {
                productId,
                isPrimary: true,
            },
            data: {
                isPrimary: false,
            },
        }),
        prisma_1.default.productImage.update({
            where: {
                id: imageId,
            },
            data: {
                isPrimary: true,
            },
        }),
    ]);
    return prisma_1.default.productImage.findUnique({
        where: {
            id: imageId,
        },
    });
};
exports.setPrimaryImage = setPrimaryImage;
