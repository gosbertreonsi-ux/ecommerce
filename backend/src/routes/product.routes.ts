import { Router } from "express";

import {
  getProductsController,
  getProductByIdController,
} from "../modules/products/product.controller";

const router = Router();

router.get(
  "/",
  getProductsController,
);

router.get(
  "/:id",
  getProductByIdController,
);

export default router;