import {
  Request,
  Response,
  NextFunction,
} from "express";

import { z } from "zod";

import * as productImageService from "./product-image.service";

const updateImageSchema =
  z.object({
    altText: z
      .string()
      .max(
        500,
        "Alt text must be 500 characters or less.",
      )
      .optional(),

    displayOrder: z
      .number()
      .int()
      .positive()
      .optional(),
  });

export const uploadImages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = Number(
      req.params.id,
    );

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      throw new Error(
        "Invalid product ID",
      );
    }

    const files =
      req.files as
        | Express.Multer.File[]
        | undefined;

    if (
      !files ||
      files.length === 0
    ) {
      throw new Error(
        "No images were uploaded",
      );
    }

    const images =
      await productImageService.addImages(
        productId,
        files,
      );

    res.status(201).json({
      success: true,
      message:
        "Product images uploaded successfully",
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

export const updateImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = Number(
      req.params.id,
    );

    const imageId = Number(
      req.params.imageId,
    );

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      throw new Error(
        "Invalid product ID",
      );
    }

    if (
      !Number.isInteger(imageId) ||
      imageId <= 0
    ) {
      throw new Error(
        "Invalid image ID",
      );
    }

    const data =
      updateImageSchema.parse(
        req.body,
      );

    const image =
      await productImageService.updateImage(
        productId,
        imageId,
        data,
      );

    res.status(200).json({
      success: true,
      message:
        "Product image updated successfully",
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = Number(
      req.params.id,
    );

    const imageId = Number(
      req.params.imageId,
    );

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      throw new Error(
        "Invalid product ID",
      );
    }

    if (
      !Number.isInteger(imageId) ||
      imageId <= 0
    ) {
      throw new Error(
        "Invalid image ID",
      );
    }

    const result =
      await productImageService.deleteImage(
        productId,
        imageId,
      );

    res.status(200).json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = Number(
      req.params.id,
    );

    const imageId = Number(
      req.params.imageId,
    );

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      throw new Error(
        "Invalid product ID",
      );
    }

    if (
      !Number.isInteger(imageId) ||
      imageId <= 0
    ) {
      throw new Error(
        "Invalid image ID",
      );
    }

    const image =
      await productImageService.setPrimaryImage(
        productId,
        imageId,
      );

    res.status(200).json({
      success: true,
      message:
        "Primary image updated successfully",
      data: image,
    });
  } catch (error) {
    next(error);
  }
};