"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getDashboardStats = async () => {
    const [totalCustomers, totalProducts, totalOrders, pendingOrders, paidOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders, pendingPayments, successfulPayments, failedPayments, revenueResult, lowStockProducts,] = await Promise.all([
        prisma_1.default.user.count({
            where: {
                role: {
                    name: "CUSTOMER",
                },
                deletedAt: null,
            },
        }),
        prisma_1.default.product.count({
            where: {
                deletedAt: null,
            },
        }),
        prisma_1.default.order.count({
            where: {
                deletedAt: null,
            },
        }),
        prisma_1.default.order.count({
            where: {
                status: "PENDING",
                deletedAt: null,
            },
        }),
        prisma_1.default.order.count({
            where: {
                status: "PAID",
                deletedAt: null,
            },
        }),
        prisma_1.default.order.count({
            where: {
                status: "PROCESSING",
                deletedAt: null,
            },
        }),
        prisma_1.default.order.count({
            where: {
                status: "SHIPPED",
                deletedAt: null,
            },
        }),
        prisma_1.default.order.count({
            where: {
                status: "DELIVERED",
                deletedAt: null,
            },
        }),
        prisma_1.default.order.count({
            where: {
                status: "CANCELLED",
                deletedAt: null,
            },
        }),
        prisma_1.default.payment.count({
            where: {
                status: "PENDING",
                deletedAt: null,
            },
        }),
        prisma_1.default.payment.count({
            where: {
                status: "SUCCESS",
                deletedAt: null,
            },
        }),
        prisma_1.default.payment.count({
            where: {
                status: "FAILED",
                deletedAt: null,
            },
        }),
        prisma_1.default.payment.aggregate({
            where: {
                status: "SUCCESS",
                deletedAt: null,
            },
            _sum: {
                amount: true,
            },
        }),
        prisma_1.default.productVariant.findMany({
            where: {
                stock: {
                    lte: 5,
                },
                product: {
                    deletedAt: null,
                    isActive: true,
                },
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        isActive: true,
                    },
                },
            },
            orderBy: {
                stock: "asc",
            },
        }),
    ]);
    return {
        overview: {
            totalCustomers,
            totalProducts,
            totalOrders,
            totalRevenue: revenueResult._sum.amount ?? 0,
        },
        orders: {
            pending: pendingOrders,
            paid: paidOrders,
            processing: processingOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders,
        },
        payments: {
            pending: pendingPayments,
            successful: successfulPayments,
            failed: failedPayments,
        },
        inventory: {
            lowStockCount: lowStockProducts.length,
            lowStockProducts,
        },
    };
};
exports.getDashboardStats = getDashboardStats;
