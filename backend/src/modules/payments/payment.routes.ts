import { Router } from "express";

import * as paymentController from "./payment.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.post("/", paymentController.createPayment);
router.get("/order/:orderId", paymentController.getPaymentByOrderId);

// Never expose the development-only endpoint that marks orders as PAID.
// Only an authenticated server-to-server payment provider callback should
// mark a real payment as successfully collected in production.
if (process.env.NODE_ENV !== "production") {
  router.post("/:id/simulate", paymentController.simulatePayment);
}

export default router;
