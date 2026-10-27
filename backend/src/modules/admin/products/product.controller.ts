import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as productService from "./product.service";

import {
  createProductSchema,
  updateProductSchema,
} from "./product.validation";

export const getProducts =
  async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const products =
        await productService.getProducts();

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

export const getProductById =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const productId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          productId,
        ) ||
        productId <= 0
      ) {
        throw new Error(
          "Invalid product ID",
        );
      }

      const product =
        await productService.getProductById(
          productId,
        );

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

export const createProduct =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data =
        createProductSchema.parse(
          req.body,
        );

      const product =
        await productService.createProduct(
          data,
        );

      res.status(201).json({
        success: true,
        message:
          "Product created successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

export const updateProduct =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const productId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          productId,
        ) ||
        productId <= 0
      ) {
        throw new Error(
          "Invalid product ID",
        );
      }

      const data =
        updateProductSchema.parse(
          req.body,
        );

      const product =
        await productService.updateProduct(
          productId,
          data,
        );

      res.status(200).json({
        success: true,
        message:
          "Product updated successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

export const deleteProduct =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const productId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          productId,
        ) ||
        productId <= 0
      ) {
        throw new Error(
          "Invalid product ID",
        );
      }

      const product =
        await productService.deleteProduct(
          productId,
        );

      res.status(200).json({
        success: true,
        message:
          "Product deleted successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };