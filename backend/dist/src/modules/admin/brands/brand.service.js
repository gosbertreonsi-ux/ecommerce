"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrands = getBrands;
exports.getBrandById = getBrandById;
exports.createBrand = createBrand;
exports.updateBrand = updateBrand;
exports.deleteBrand = deleteBrand;
const prisma_1 = __importDefault(require("../../../config/prisma"));
async function getBrands() {
    return prisma_1.default.brand.findMany({
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
async function getBrandById(id) {
    const brand = await prisma_1.default.brand.findUnique({
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
        throw new Error("Brand not found");
    }
    return brand;
}
async function createBrand(data) {
    const existingBrand = await prisma_1.default.brand.findFirst({
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
        if (existingBrand.name.toLowerCase() ===
            data.name.toLowerCase()) {
            throw new Error("A brand with this name already exists");
        }
        if (existingBrand.slug ===
            data.slug) {
            throw new Error("A brand with this slug already exists");
        }
    }
    return prisma_1.default.brand.create({
        data: {
            name: data.name,
            slug: data.slug,
            isActive: data.isActive,
        },
    });
}
async function updateBrand(id, data) {
    const existingBrand = await prisma_1.default.brand.findUnique({
        where: {
            id,
        },
    });
    if (!existingBrand) {
        throw new Error("Brand not found");
    }
    if (data.name !== undefined &&
        data.name.toLowerCase() !==
            existingBrand.name.toLowerCase()) {
        const duplicateName = await prisma_1.default.brand.findFirst({
            where: {
                id: {
                    not: id,
                },
                name: data.name,
            },
        });
        if (duplicateName) {
            throw new Error("A brand with this name already exists");
        }
    }
    if (data.slug !== undefined &&
        data.slug !==
            existingBrand.slug) {
        const duplicateSlug = await prisma_1.default.brand.findFirst({
            where: {
                id: {
                    not: id,
                },
                slug: data.slug,
            },
        });
        if (duplicateSlug) {
            throw new Error("A brand with this slug already exists");
        }
    }
    const updateData = {};
    if (data.name !== undefined) {
        updateData.name =
            data.name;
    }
    if (data.slug !== undefined) {
        updateData.slug =
            data.slug;
    }
    if (data.isActive !==
        undefined) {
        updateData.isActive =
            data.isActive;
    }
    return prisma_1.default.brand.update({
        where: {
            id,
        },
        data: updateData,
    });
}
async function deleteBrand(id) {
    const brand = await prisma_1.default.brand.findUnique({
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
        throw new Error("Brand not found");
    }
    if (brand.products.length > 0) {
        throw new Error("Cannot deactivate a brand that still has active products");
    }
    return prisma_1.default.brand.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });
}
