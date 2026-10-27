"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviews = getReviews;
exports.getReviewById = getReviewById;
exports.updateReviewStatus = updateReviewStatus;
exports.deleteReview = deleteReview;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const reviewInclude = {
    user: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
    product: {
        select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
            images: {
                orderBy: {
                    displayOrder: "asc",
                },
            },
        },
    },
};
async function getReviews(query) {
    return prisma_1.default.review.findMany({
        where: {
            deletedAt: null,
            ...(query.status
                ? {
                    status: query.status,
                }
                : {}),
        },
        include: reviewInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getReviewById(id) {
    const review = await prisma_1.default.review.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: reviewInclude,
    });
    if (!review) {
        throw new Error("Review not found");
    }
    return review;
}
async function updateReviewStatus(id, data) {
    const review = await prisma_1.default.review.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!review) {
        throw new Error("Review not found");
    }
    if (review.status ===
        data.status) {
        throw new Error(`Review is already ${data.status}`);
    }
    return prisma_1.default.review.update({
        where: {
            id,
        },
        data: {
            status: data.status,
        },
        include: reviewInclude,
    });
}
async function deleteReview(id) {
    const review = await prisma_1.default.review.findFirst({
        where: {
            id,
            deletedAt: null,
        },
    });
    if (!review) {
        throw new Error("Review not found");
    }
    return prisma_1.default.review.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
        include: reviewInclude,
    });
}
