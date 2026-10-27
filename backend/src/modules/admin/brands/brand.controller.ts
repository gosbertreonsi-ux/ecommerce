import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as brandService from "./brand.service";

import {
  createBrandSchema,
  updateBrandSchema,
} from "./brand.validation";

export const getBrands =
  async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const brands =
        await brandService.getBrands();

      res.status(200).json({
        success: true,
        data: brands,
      });
    } catch (error) {
      next(error);
    }
  };

export const getBrandById =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const brandId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          brandId,
        ) ||
        brandId <= 0
      ) {
        throw new Error(
          "Invalid brand ID",
        );
      }

      const brand =
        await brandService.getBrandById(
          brandId,
        );

      res.status(200).json({
        success: true,
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  };

export const createBrand =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data =
        createBrandSchema.parse(
          req.body,
        );

      const brand =
        await brandService.createBrand(
          data,
        );

      res.status(201).json({
        success: true,
        message:
          "Brand created successfully",
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  };

export const updateBrand =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const brandId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          brandId,
        ) ||
        brandId <= 0
      ) {
        throw new Error(
          "Invalid brand ID",
        );
      }

      const data =
        updateBrandSchema.parse(
          req.body,
        );

      const brand =
        await brandService.updateBrand(
          brandId,
          data,
        );

      res.status(200).json({
        success: true,
        message:
          "Brand updated successfully",
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  };

export const deleteBrand =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const brandId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          brandId,
        ) ||
        brandId <= 0
      ) {
        throw new Error(
          "Invalid brand ID",
        );
      }

      const brand =
        await brandService.deleteBrand(
          brandId,
        );

      res.status(200).json({
        success: true,
        message:
          "Brand deactivated successfully",
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  };