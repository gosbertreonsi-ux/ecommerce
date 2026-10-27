"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = getProducts;
exports.getProductById = getProductById;
const prisma_1 = __importDefault(require("../../config/prisma"));
async function getProducts() {
    return prisma_1.default.product.findMany({
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
async function getProductById(id) {
    return prisma_1.default.product.findFirst({
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
