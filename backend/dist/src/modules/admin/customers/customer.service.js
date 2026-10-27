"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = getCustomers;
exports.getCustomerById = getCustomerById;
exports.updateCustomerStatus = updateCustomerStatus;
const prisma_1 = __importDefault(require("../../../config/prisma"));
async function getCustomers(query) {
    const search = query.search?.trim();
    return prisma_1.default.user.findMany({
        where: {
            role: {
                name: "CUSTOMER",
            },
            deletedAt: null,
            ...(search
                ? {
                    OR: [
                        {
                            firstName: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            lastName: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            email: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }
                : {}),
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            _count: {
                select: {
                    orders: true,
                    reviews: true,
                },
            },
            orders: {
                where: {
                    deletedAt: null,
                },
                select: {
                    total: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getCustomerById(id) {
    const customer = await prisma_1.default.user.findFirst({
        where: {
            id,
            role: {
                name: "CUSTOMER",
            },
            deletedAt: null,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            addresses: {
                where: {
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            orders: {
                where: {
                    deletedAt: null,
                },
                include: {
                    payment: true,
                    items: {
                        where: {
                            deletedAt: null,
                        },
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    sku: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            reviews: {
                where: {
                    deletedAt: null,
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            _count: {
                select: {
                    orders: true,
                    reviews: true,
                },
            },
        },
    });
    if (!customer) {
        throw new Error("Customer not found");
    }
    return customer;
}
async function updateCustomerStatus(id, data) {
    const customer = await prisma_1.default.user.findFirst({
        where: {
            id,
            role: {
                name: "CUSTOMER",
            },
            deletedAt: null,
        },
    });
    if (!customer) {
        throw new Error("Customer not found");
    }
    return prisma_1.default.user.update({
        where: {
            id,
        },
        data: {
            isActive: data.isActive,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
            updatedAt: true,
        },
    });
}
