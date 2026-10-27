import { Router } from "express";

import * as orderController from "./order.controller";

const router = Router();

router.get(
  "/",
  orderController.getOrders,
);

router.get(
  "/:id",
  orderController.getOrderById,
);

router.patch(
  "/:id/status",
  orderController.updateOrderStatus,
);

export default router;