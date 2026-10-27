import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as customerService from "./customer.service";

import {
  customerQuerySchema,
  updateCustomerStatusSchema,
} from "./customer.validation";

export const getCustomers =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query =
        customerQuerySchema.parse(
          req.query,
        );

      const customers =
        await customerService.getCustomers(
          query,
        );

      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  };

export const getCustomerById =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const customerId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          customerId,
        ) ||
        customerId <= 0
      ) {
        throw new Error(
          "Invalid customer ID",
        );
      }

      const customer =
        await customerService.getCustomerById(
          customerId,
        );

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

export const updateCustomerStatus =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const customerId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          customerId,
        ) ||
        customerId <= 0
      ) {
        throw new Error(
          "Invalid customer ID",
        );
      }

      const data =
        updateCustomerStatusSchema.parse(
          req.body,
        );

      const customer =
        await customerService.updateCustomerStatus(
          customerId,
          data,
        );

      res.status(200).json({
        success: true,
        message:
          "Customer status updated successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };