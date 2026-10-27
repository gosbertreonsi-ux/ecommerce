import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as orderService from "./order.service";

import {
  orderQuerySchema,
  updateOrderStatusSchema,
} from "./order.validation";

export const getOrders =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query =
        orderQuerySchema.parse(
          req.query,
        );

      const orders =
        await orderService.getOrders(
          query,
        );

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };

export const getOrderById =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const orderId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          orderId,
        ) ||
        orderId <= 0
      ) {
        throw new Error(
          "Invalid order ID",
        );
      }

      const order =
        await orderService.getOrderById(
          orderId,
        );

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

export const updateOrderStatus =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const orderId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          orderId,
        ) ||
        orderId <= 0
      ) {
        throw new Error(
          "Invalid order ID",
        );
      }

      const data =
        updateOrderStatusSchema.parse(
          req.body,
        );

      const order =
        await orderService.updateOrderStatus(
          orderId,
          data,
        );

      res.status(200).json({
        success: true,
        message:
          "Order status updated successfully",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };