import { Router } from "express";

import * as paymentController from "./payment.controller";

const router = Router();

router.get(
  "/",
  paymentController.getPayments,
);

router.get(
  "/:id",
  paymentController.getPaymentById,
);

router.patch(
  "/:id/status",
  paymentController.updatePaymentStatus,
);

export default router;