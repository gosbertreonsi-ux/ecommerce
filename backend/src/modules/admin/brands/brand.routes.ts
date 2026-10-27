import { Router } from "express";

import * as brandController from "./brand.controller";

const router = Router();

router.get(
  "/",
  brandController.getBrands,
);

router.get(
  "/:id",
  brandController.getBrandById,
);

router.post(
  "/",
  brandController.createBrand,
);

router.patch(
  "/:id",
  brandController.updateBrand,
);

router.delete(
  "/:id",
  brandController.deleteBrand,
);

export default router;