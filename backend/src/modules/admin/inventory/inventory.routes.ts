import { Router } from "express";

import * as inventoryController from "./inventory.controller";

const router = Router();

router.get(
  "/",
  inventoryController.getInventory,
);

router.get(
  "/low-stock",
  inventoryController.getLowStockInventory,
);

router.get(
  "/movements",
  inventoryController.getInventoryMovements,
);

router.post(
  "/adjust",
  inventoryController.adjustInventory,
);

export default router;