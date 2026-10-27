import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as inventoryService from "./inventory.service";

import {
  adjustInventorySchema,
  inventoryQuerySchema,
} from "./inventory.validation";

export const getInventory =
  async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const inventory =
        await inventoryService.getInventory();

      res.status(200).json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  };

export const getLowStockInventory =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const thresholdValue =
        req.query.threshold;

      const threshold =
        thresholdValue ===
        undefined
          ? 5
          : Number(
              thresholdValue,
            );

      const inventory =
        await inventoryService.getLowStockInventory(
          threshold,
        );

      res.status(200).json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  };

export const getInventoryMovements =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query =
        inventoryQuerySchema.parse(
          req.query,
        );

      const movements =
        await inventoryService.getInventoryMovements(
          query,
        );

      res.status(200).json({
        success: true,
        data: movements,
      });
    } catch (error) {
      next(error);
    }
  };

export const adjustInventory =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data =
        adjustInventorySchema.parse(
          req.body,
        );

      const inventory =
        await inventoryService.adjustInventory(
          data,
        );

      res.status(200).json({
        success: true,
        message:
          "Inventory updated successfully",
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  };