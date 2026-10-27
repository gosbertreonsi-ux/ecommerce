import { Router } from "express";

import * as customerController from "./customer.controller";

const router = Router();

router.get(
  "/",
  customerController.getCustomers,
);

router.get(
  "/:id",
  customerController.getCustomerById,
);

router.patch(
  "/:id/status",
  customerController.updateCustomerStatus,
);

export default router;