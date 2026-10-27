"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReviewStatus = exports.getReviewById = exports.getReviews = void 0;
const reviewService = __importStar(require("./review.service"));
const review_validation_1 = require("./review.validation");
const getReviews = async (req, res, next) => {
    try {
        const query = review_validation_1.reviewQuerySchema.parse(req.query);
        const reviews = await reviewService.getReviews(query);
        res.status(200).json({
            success: true,
            data: reviews,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviews = getReviews;
const getReviewById = async (req, res, next) => {
    try {
        const reviewId = Number(req.params.id);
        if (!Number.isInteger(reviewId) ||
            reviewId <= 0) {
            throw new Error("Invalid review ID");
        }
        const review = await reviewService.getReviewById(reviewId);
        res.status(200).json({
            success: true,
            data: review,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviewById = getReviewById;
const updateReviewStatus = async (req, res, next) => {
    try {
        const reviewId = Number(req.params.id);
        if (!Number.isInteger(reviewId) ||
            reviewId <= 0) {
            throw new Error("Invalid review ID");
        }
        const data = review_validation_1.updateReviewStatusSchema.parse(req.body);
        const review = await reviewService.updateReviewStatus(reviewId, data);
        res.status(200).json({
            success: true,
            message: "Review status updated successfully",
            data: review,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateReviewStatus = updateReviewStatus;
const deleteReview = async (req, res, next) => {
    try {
        const reviewId = Number(req.params.id);
        if (!Number.isInteger(reviewId) ||
            reviewId <= 0) {
            throw new Error("Invalid review ID");
        }
        const review = await reviewService.deleteReview(reviewId);
        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            data: review,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteReview = deleteReview;
