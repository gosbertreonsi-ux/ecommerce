import {
  Router,
} from "express";

import * as reviewController from "./review.controller";

import {
  authenticate,
} from "../../middlewares/auth.middleware";

const router =
  Router();

router.use(
  authenticate,
);

router.get(
  "/my",
  reviewController.getMyReviews,
);

router.post(
  "/",
  reviewController.createReview,
);

export default router;