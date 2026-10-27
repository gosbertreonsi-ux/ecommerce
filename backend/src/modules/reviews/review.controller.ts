import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as reviewService from "./review.service";

import {
  createReviewSchema,
} from "./review.validation";

/*
|--------------------------------------------------------------------------
| CREATE REVIEW
|--------------------------------------------------------------------------
*/

export const createReview =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data =
        createReviewSchema.parse(
          req.body,
        );

      const review =
        await reviewService.createReview(
          req.user!.id,
          data,
        );

      res.status(201).json({
        success: true,
        message:
          "Review submitted successfully and is awaiting approval",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| GET MY REVIEWS
|--------------------------------------------------------------------------
*/

export const getMyReviews =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const reviews =
        await reviewService.getMyReviews(
          req.user!.id,
        );

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  };