import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as paymentService from "./payment.service";

import {
  createPaymentSchema,
} from "./payment.validation";

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data =
      createPaymentSchema.parse(
        req.body,
      );

    const payment =
      await paymentService.createPayment(
        req.user!.id,
        data,
      );

    res.status(201).json({
      success: true,
      message:
        "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentByOrderId =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const orderId =
        Number(req.params.orderId);

      if (
        !Number.isInteger(orderId) ||
        orderId <= 0
      ) {
        throw new Error(
          "Invalid order ID",
        );
      }

      const payment =
        await paymentService.getPaymentByOrderId(
          req.user!.id,
          orderId,
        );

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };

export const simulatePayment =
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

      const status =
        req.body.status;

      if (
        status !== "SUCCESS" &&
        status !== "FAILED"
      ) {
        throw new Error(
          "Simulation status must be SUCCESS or FAILED",
        );
      }

      const transactionId =
        typeof req.body
          .transactionId ===
          "string"
          ? req.body.transactionId
          : null;

      const payment =
        await paymentService.simulatePayment(
          req.user!.id,
          paymentId,
          status,
          transactionId,
        );

      res.status(200).json({
        success: true,
        message:
          "Payment simulation completed successfully",
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  };