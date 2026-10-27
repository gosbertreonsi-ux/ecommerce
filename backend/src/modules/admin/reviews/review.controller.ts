import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as reviewService from "./review.service";

import {
  reviewQuerySchema,
  updateReviewStatusSchema,
} from "./review.validation";

export const getReviews =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query =
        reviewQuerySchema.parse(
          req.query,
        );

      const reviews =
        await reviewService.getReviews(
          query,
        );

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  };

export const getReviewById =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const reviewId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          reviewId,
        ) ||
        reviewId <= 0
      ) {
        throw new Error(
          "Invalid review ID",
        );
      }

      const review =
        await reviewService.getReviewById(
          reviewId,
        );

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

export const updateReviewStatus =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const reviewId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          reviewId,
        ) ||
        reviewId <= 0
      ) {
        throw new Error(
          "Invalid review ID",
        );
      }

      const data =
        updateReviewStatusSchema.parse(
          req.body,
        );

      const review =
        await reviewService.updateReviewStatus(
          reviewId,
          data,
        );

      res.status(200).json({
        success: true,
        message:
          "Review status updated successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

export const deleteReview =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const reviewId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          reviewId,
        ) ||
        reviewId <= 0
      ) {
        throw new Error(
          "Invalid review ID",
        );
      }

      const review =
        await reviewService.deleteReview(
          reviewId,
        );

      res.status(200).json({
        success: true,
        message:
          "Review deleted successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };