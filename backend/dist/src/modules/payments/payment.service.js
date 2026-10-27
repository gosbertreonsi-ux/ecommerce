"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = createPayment;
exports.getPaymentByOrderId = getPaymentByOrderId;
exports.simulatePayment = simulatePayment;
const prisma_1 = __importDefault(require("../../config/prisma"));
/*
|--------------------------------------------------------------------------
| PAYMENT INCLUDE
|--------------------------------------------------------------------------
*/
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
                            price: true,
                            images: true,
                        },
                    },
                    variant: true,
                },
            },
            payment: true,
        },
    },
};
/*
|--------------------------------------------------------------------------
| CREATE PAYMENT
|--------------------------------------------------------------------------
|
| Creates or returns the payment belonging to the authenticated user's
| order.
|
| The order service already creates a PENDING payment during checkout.
| Therefore, if one already exists, we return it instead of creating
| a duplicate payment.
|
*/
async function createPayment(userId, data) {
    const order = await prisma_1.default.order.findFirst({
        where: {
            id: data.orderId,
            userId,
            deletedAt: null,
        },
        include: {
            payment: true,
        },
    });
    if (!order) {
        throw new Error("Order not found");
    }
    if (order.status ===
        "CANCELLED") {
        throw new Error("Cannot create a payment for a cancelled order");
    }
    /*
    |--------------------------------------------------------------------------
    | EXISTING PAYMENT
    |--------------------------------------------------------------------------
    */
    if (order.payment) {
        if (order.payment.method !==
            data.method) {
            throw new Error(`A payment already exists for this order using ${order.payment.method}`);
        }
        return prisma_1.default.payment.findUnique({
            where: {
                id: order.payment.id,
            },
            include: paymentInclude,
        });
    }
    /*
    |--------------------------------------------------------------------------
    | CREATE PAYMENT
    |--------------------------------------------------------------------------
    */
    return prisma_1.default.payment.create({
        data: {
            amount: order.total,
            method: data.method,
            status: "PENDING",
            orderId: order.id,
        },
        include: paymentInclude,
    });
}
/*
|--------------------------------------------------------------------------
| GET PAYMENT BY ORDER ID
|--------------------------------------------------------------------------
*/
async function getPaymentByOrderId(userId, orderId) {
    const payment = await prisma_1.default.payment.findFirst({
        where: {
            orderId,
            deletedAt: null,
            order: {
                userId,
                deletedAt: null,
            },
        },
        include: paymentInclude,
    });
    if (!payment) {
        throw new Error("Payment not found");
    }
    return payment;
}
/*
|--------------------------------------------------------------------------
| SIMULATE PAYMENT
|--------------------------------------------------------------------------
|
| Development/testing payment simulation.
|
| SUCCESS:
|   PENDING payment → SUCCESS
|   Order → PAID
|
| FAILED:
|   PENDING payment → FAILED
|
| This endpoint is intentionally limited to SUCCESS/FAILED because
| REFUNDED is an administrative operation.
|
*/
async function simulatePayment(userId, paymentId, status, transactionId) {
    const payment = await prisma_1.default.payment.findFirst({
        where: {
            id: paymentId,
            deletedAt: null,
            order: {
                userId,
                deletedAt: null,
            },
        },
        include: {
            order: true,
        },
    });
    if (!payment) {
        throw new Error("Payment not found");
    }
    /*
    |--------------------------------------------------------------------------
    | PAYMENT MUST BE PENDING
    |--------------------------------------------------------------------------
    */
    if (payment.status !==
        "PENDING") {
        throw new Error(`Payment is already ${payment.status}`);
    }
    /*
    |--------------------------------------------------------------------------
    | ORDER VALIDATION
    |--------------------------------------------------------------------------
    */
    if (payment.order.status ===
        "CANCELLED") {
        throw new Error("Cannot process payment for a cancelled order");
    }
    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */
    if (status ===
        "SUCCESS") {
        return prisma_1.default.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.update({
                where: {
                    id: paymentId,
                },
                data: {
                    status: "SUCCESS",
                    transactionId: transactionId ||
                        `SIM-${Date.now()}-${paymentId}`,
                },
            });
            await tx.order.update({
                where: {
                    id: payment.orderId,
                },
                data: {
                    status: "PAID",
                },
            });
            return tx.payment.findUnique({
                where: {
                    id: updatedPayment.id,
                },
                include: paymentInclude,
            });
        });
    }
    /*
    |--------------------------------------------------------------------------
    | FAILED
    |--------------------------------------------------------------------------
    */
    return prisma_1.default.payment.update({
        where: {
            id: paymentId,
        },
        data: {
            status: "FAILED",
            transactionId: transactionId ||
                undefined,
        },
        include: paymentInclude,
    });
}
