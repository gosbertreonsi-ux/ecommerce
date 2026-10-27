"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = getPayments;
exports.getPaymentById = getPaymentById;
exports.updatePaymentStatus = updatePaymentStatus;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const paymentInclude = {
    order: {
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            items: {
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
    },
};
async function getPayments(query) {
    return prisma_1.default.payment.findMany({
        where: {
            deletedAt: null,
            ...(query.status
                ? {
                    status: query.status,
                }
                : {}),
            ...(query.method
                ? {
                    method: query.method,
                }
                : {}),
        },
        include: paymentInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getPaymentById(id) {
    const payment = await prisma_1.default.payment.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: paymentInclude,
    });
    if (!payment) {
        throw new Error("Payment not found");
    }
    return payment;
}
const allowedTransitions = {
    PENDING: [
        "SUCCESS",
        "FAILED",
    ],
    SUCCESS: [
        "REFUNDED",
    ],
    FAILED: [
        "PENDING",
    ],
    REFUNDED: [],
};
async function updatePaymentStatus(id, data) {
    const payment = await prisma_1.default.payment.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            order: true,
        },
    });
    if (!payment) {
        throw new Error("Payment not found");
    }
    const currentStatus = payment.status;
    const newStatus = data.status;
    if (currentStatus ===
        newStatus) {
        throw new Error(`Payment is already ${newStatus}`);
    }
    const allowed = allowedTransitions[currentStatus];
    if (!allowed.includes(newStatus)) {
        throw new Error(`Cannot change payment status from ${currentStatus} to ${newStatus}`);
    }
    if (newStatus === "FAILED" &&
        payment.order.status ===
            "PAID") {
        throw new Error("A successful order payment cannot be marked as FAILED");
    }
    return prisma_1.default.$transaction(async (tx) => {
        await tx.payment.update({
            where: {
                id,
            },
            data: {
                status: newStatus,
            },
        });
        if (newStatus === "SUCCESS") {
            await tx.order.update({
                where: {
                    id: payment.orderId,
                },
                data: {
                    status: "PAID",
                },
            });
        }
        if (newStatus === "REFUNDED") {
            await tx.order.update({
                where: {
                    id: payment.orderId,
                },
                data: {
                    status: "CANCELLED",
                },
            });
        }
        return tx.payment.findUnique({
            where: {
                id,
            },
            include: paymentInclude,
        });
    });
}
