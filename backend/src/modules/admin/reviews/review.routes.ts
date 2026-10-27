import { Router } from "express";

import * as reviewController from "./review.controller";

const router = Router();

router.get(
  "/",
  reviewController.getReviews,
);

router.get(
  "/:id",
  reviewController.getReviewById,
);

router.patch(
  "/:id/status",
  reviewController.updateReviewStatus,
);

router.delete(
  "/:id",
  reviewController.deleteReview,
);

export default router;