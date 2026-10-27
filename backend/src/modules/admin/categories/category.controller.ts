import {
  Request,
  Response,
  NextFunction,
} from "express";

import * as categoryService from "./category.service";

import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";

export const getCategories =
  async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const categories =
        await categoryService.getCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

export const getCategoryById =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const categoryId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          categoryId,
        ) ||
        categoryId <= 0
      ) {
        throw new Error(
          "Invalid category ID",
        );
      }

      const category =
        await categoryService.getCategoryById(
          categoryId,
        );

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

export const createCategory =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data =
        createCategorySchema.parse(
          req.body,
        );

      const category =
        await categoryService.createCategory(
          data,
        );

      res.status(201).json({
        success: true,
        message:
          "Category created successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

export const updateCategory =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const categoryId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          categoryId,
        ) ||
        categoryId <= 0
      ) {
        throw new Error(
          "Invalid category ID",
        );
      }

      const data =
        updateCategorySchema.parse(
          req.body,
        );

      const category =
        await categoryService.updateCategory(
          categoryId,
          data,
        );

      res.status(200).json({
        success: true,
        message:
          "Category updated successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

export const deleteCategory =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const categoryId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          categoryId,
        ) ||
        categoryId <= 0
      ) {
        throw new Error(
          "Invalid category ID",
        );
      }

      const category =
        await categoryService.deleteCategory(
          categoryId,
        );

      res.status(200).json({
        success: true,
        message:
          "Category deleted successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };