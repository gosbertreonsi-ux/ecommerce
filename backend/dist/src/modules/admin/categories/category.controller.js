"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const categoryService = __importStar(require("./category.service"));
const category_validation_1 = require("./category.validation");
const getCategories = async (_req, res, next) => {
    try {
        const categories = await categoryService.getCategories();
        res.status(200).json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const getCategoryById = async (req, res, next) => {
    try {
        const categoryId = Number(req.params.id);
        if (!Number.isInteger(categoryId) ||
            categoryId <= 0) {
            throw new Error("Invalid category ID");
        }
        const category = await categoryService.getCategoryById(categoryId);
        res.status(200).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryById = getCategoryById;
const createCategory = async (req, res, next) => {
    try {
        const data = category_validation_1.createCategorySchema.parse(req.body);
        const category = await categoryService.createCategory(data);
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    try {
        const categoryId = Number(req.params.id);
        if (!Number.isInteger(categoryId) ||
            categoryId <= 0) {
            throw new Error("Invalid category ID");
        }
        const data = category_validation_1.updateCategorySchema.parse(req.body);
        const category = await categoryService.updateCategory(categoryId, data);
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const categoryId = Number(req.params.id);
        if (!Number.isInteger(categoryId) ||
            categoryId <= 0) {
            throw new Error("Invalid category ID");
        }
        const category = await categoryService.deleteCategory(categoryId);
        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
