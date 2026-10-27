import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as adminService from "./admin.service";

export const getDashboardStats =
  async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const stats =
        await adminService.getDashboardStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };