import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as addressService from "./address.service";

import {
  createAddressSchema,
} from "./address.validation";

export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("AUTH USER:", req.user);

    const addresses =
      await addressService.getMyAddresses(
        req.user!.id,
      );

    console.log("ADDRESSES FROM DATABASE:", addresses);

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data =
      createAddressSchema.parse(
        req.body,
      );

    const address =
      await addressService.createAddress(
        req.user!.id,
        data,
      );

    res.status(201).json({
      success: true,
      message:
        "Address created successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const addressId =
      Number(req.params.id);

    if (Number.isNaN(addressId)) {
      throw new Error(
        "Invalid address ID",
      );
    }

    const result =
      await addressService.deleteAddress(
        req.user!.id,
        addressId,
      );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};