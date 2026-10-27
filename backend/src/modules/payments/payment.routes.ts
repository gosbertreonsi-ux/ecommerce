import { Router } from "express";

import * as paymentController from "./payment.controller";

import {
  authenticate,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  paymentController.createPayment,
);

router.get(
  "/order/:orderId",
  paymentController.getPaymentByOrderId,
);

router.post(
  "/:id/simulate",
  paymentController.simulatePayment,
);

export default router;