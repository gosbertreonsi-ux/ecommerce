import { Router } from "express";

import {
  productImageUpload,
} from "../../../middlewares/upload.middleware";

import * as productImageController from "./product-image.controller";

const router = Router();

// Upload product images
router.post(
  "/:id/images",
  productImageUpload.array(
    "images",
    10,
  ),
  productImageController.uploadImages,
);

// Update image metadata
router.patch(
  "/:id/images/:imageId",
  productImageController.updateImage,
);

// Delete product image
router.delete(
  "/:id/images/:imageId",
  productImageController.deleteImage,
);

// Set primary image
router.patch(
  "/:id/images/:imageId/primary",
  productImageController.setPrimaryImage,
);

export default router;