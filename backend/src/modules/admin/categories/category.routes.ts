import { Router } from "express";

import * as categoryController from "./category.controller";

const router = Router();

router.get(
  "/",
  categoryController.getCategories,
);

router.get(
  "/:id",
  categoryController.getCategoryById,
);

router.post(
  "/",
  categoryController.createCategory,
);

router.patch(
  "/:id",
  categoryController.updateCategory,
);

router.delete(
  "/:id",
  categoryController.deleteCategory,
);

export default router;