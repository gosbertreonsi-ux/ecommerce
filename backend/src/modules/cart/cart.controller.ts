import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as cartService from "./cart.service";

import {
  addCartItemSchema,
  updateCartItemSchema,
} from "./cart.validation";

/*
|--------------------------------------------------------------------------
| GET CART
|--------------------------------------------------------------------------
*/

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart =
      await cartService.getCart(
        req.user!.id,
      );

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADD ITEM
|--------------------------------------------------------------------------
*/

export const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data =
      addCartItemSchema.parse(
        req.body,
      );

    const item =
      await cartService.addItem(
        req.user!.id,
        data.productId,
        data.variantId,
        data.quantity,
      );

    res.status(201).json({
      success: true,
      message:
        "Product variant added to cart",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ITEM
|--------------------------------------------------------------------------
*/

export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const variantId =
      Number(
        req.params.variantId,
      );

    if (
      !Number.isInteger(
        variantId,
      ) ||
      variantId <= 0
    ) {
      throw new Error(
        "Invalid variant ID",
      );
    }

    const data =
      updateCartItemSchema.parse(
        req.body,
      );

    const item =
      await cartService.updateItem(
        req.user!.id,
        variantId,
        data.quantity,
      );

    res.status(200).json({
      success: true,
      message:
        "Cart item updated",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| REMOVE ITEM
|--------------------------------------------------------------------------
*/

export const removeItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const variantId =
      Number(
        req.params.variantId,
      );

    if (
      !Number.isInteger(
        variantId,
      ) ||
      variantId <= 0
    ) {
      throw new Error(
        "Invalid variant ID",
      );
    }

    const result =
      await cartService.removeItem(
        req.user!.id,
        variantId,
      );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CLEAR CART
|--------------------------------------------------------------------------
*/

export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result =
      await cartService.clearCart(
        req.user!.id,
      );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};