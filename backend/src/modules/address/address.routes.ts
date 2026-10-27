import { Router } from "express";

import * as addressController from "./address.controller";

import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  addressController.getAddresses,
);

router.post(
  "/",
  addressController.createAddress,
);

router.delete(
  "/:id",
  addressController.deleteAddress,
);

export default router;