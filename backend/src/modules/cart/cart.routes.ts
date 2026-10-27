import { Router } from "express";

import * as cartController from "./cart.controller";

import {
  authenticate,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  cartController.getCart,
);

router.post(
  "/items",
  cartController.addItem,
);

router.patch(
  "/items/:variantId",
  cartController.updateItem,
);

router.delete(
  "/items/:variantId",
  cartController.removeItem,
);

router.delete(
  "/",
  cartController.clearCart,
);

export default router;