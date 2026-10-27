import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as paymentService from "./payment.service";

import {
  paymentQuerySchema,
  updatePaymentStatusSchema,
} from "./payment.validation";

export const getPayments =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query =
        paymentQuerySchema.parse(
          req.query,
        );

      const payments =
        await paymentService.getPayments(
          query,
        );

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  };

export const getPaymentById =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const paymentId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          paymentId,
        ) ||
        paymentId <= 0
      ) {
        throw new Error(
          "Invalid payment ID",
        );
      }

      const payment =
        await paymentService.getPaymentById(
          paymentId,
        );

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };

export const updatePaymentStatus =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const paymentId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          paymentId,
        ) ||
        paymentId <= 0
      ) {
        throw new Error(
          "Invalid payment ID",
        );
      }

      const data =
        updatePaymentStatusSchema.parse(
          req.body,
        );

      const payment =
        await paymentService.updatePaymentStatus(
          paymentId,
          data,
        );

      res.status(200).json({
        success: true,
        message:
          "Payment status updated successfully",
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };