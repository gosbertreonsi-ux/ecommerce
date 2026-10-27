"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const prisma_1 = __importDefault(require("../../../config/prisma"));
async function getCategories() {
    return prisma_1.default.category.findMany({
        where: {
            deletedAt: null,
        },
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
async function getCategoryById(id) {
    const category = await prisma_1.default.category.findFirst({
        where: {
            id,
            deletedAt: null,
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
                },
            },
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });
    if (!category) {
        throw new Error("Category not found");
    }
    return category;
}
async function createCategory(data) {
    const existingCategory = await prisma_1.default.category.findFirst({
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
    if (existingCategory) {
        if (existingCategory.name.toLowerCase() ===
            data.name.toLowerCase()) {
            throw new Error("A category with this name already exists");
        }
        if (existingCategory.slug ===
            data.slug) {
            throw new Error("A category with this slug already exists");
        }
    }
    return prisma_1.default.category.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
        },
    });
}
async function updateCategory(id, data) {
    const existingCategory = await prisma_1.default.category.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!existingCategory) {
        throw new Error("Category not found");
    }
    if (data.name !== undefined &&
        data.name.toLowerCase() !==
            existingCategory.name.toLowerCase()) {
        const duplicateName = await prisma_1.default.category.findFirst({
            where: {
                id: {
                    not: id,
                },
                name: data.name,
                deletedAt: null,
            },
        });
        if (duplicateName) {
            throw new Error("A category with this name already exists");
        }
    }
    if (data.slug !== undefined &&
        data.slug !==
            existingCategory.slug) {
        const duplicateSlug = await prisma_1.default.category.findFirst({
            where: {
                id: {
                    not: id,
                },
                slug: data.slug,
                deletedAt: null,
            },
        });
        if (duplicateSlug) {
            throw new Error("A category with this slug already exists");
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
    if (data.description !==
        undefined) {
        updateData.description =
            data.description;
    }
    return prisma_1.default.category.update({
        where: {
            id,
        },
        data: updateData,
    });
}
async function deleteCategory(id) {
    const category = await prisma_1.default.category.findFirst({
        where: {
            id,
            deletedAt: null,
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
    if (!category) {
        throw new Error("Category not found");
    }
    if (category.products.length > 0) {
        throw new Error("Cannot delete a category that still contains active products");
    }
    return prisma_1.default.category.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
}
