import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getProducts,
  getProductById,
} from "./product.service";

export async function getProductsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const products =
      await getProducts();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(
      req.params.id,
    );

    if (Number.isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });

      return;
    }

    const product =
      await getProductById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}