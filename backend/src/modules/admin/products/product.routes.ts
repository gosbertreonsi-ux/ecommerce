import { Router } from "express";

import * as productController from "./product.controller";

import productImageRoutes from "./product-image.routes";

const router = Router();

// ================================
// Product Image Routes
// ================================

router.use(
  "/",
  productImageRoutes,
);

// ================================
// Product Routes
// ================================

router.get(
  "/",
  productController.getProducts,
);

router.get(
  "/:id",
  productController.getProductById,
);

router.post(
  "/",
  productController.createProduct,
);

router.patch(
  "/:id",
  productController.updateProduct,
);

router.delete(
  "/:id",
  productController.deleteProduct,
);

export default router;