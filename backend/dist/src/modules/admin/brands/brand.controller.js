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
exports.deleteBrand = exports.updateBrand = exports.createBrand = exports.getBrandById = exports.getBrands = void 0;
const brandService = __importStar(require("./brand.service"));
const brand_validation_1 = require("./brand.validation");
const getBrands = async (_req, res, next) => {
    try {
        const brands = await brandService.getBrands();
        res.status(200).json({
            success: true,
            data: brands,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBrands = getBrands;
const getBrandById = async (req, res, next) => {
    try {
        const brandId = Number(req.params.id);
        if (!Number.isInteger(brandId) ||
            brandId <= 0) {
            throw new Error("Invalid brand ID");
        }
        const brand = await brandService.getBrandById(brandId);
        res.status(200).json({
            success: true,
            data: brand,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBrandById = getBrandById;
const createBrand = async (req, res, next) => {
    try {
        const data = brand_validation_1.createBrandSchema.parse(req.body);
        const brand = await brandService.createBrand(data);
        res.status(201).json({
            success: true,
            message: "Brand created successfully",
            data: brand,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createBrand = createBrand;
const updateBrand = async (req, res, next) => {
    try {
        const brandId = Number(req.params.id);
        if (!Number.isInteger(brandId) ||
            brandId <= 0) {
            throw new Error("Invalid brand ID");
        }
        const data = brand_validation_1.updateBrandSchema.parse(req.body);
        const brand = await brandService.updateBrand(brandId, data);
        res.status(200).json({
            success: true,
            message: "Brand updated successfully",
            data: brand,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateBrand = updateBrand;
const deleteBrand = async (req, res, next) => {
    try {
        const brandId = Number(req.params.id);
        if (!Number.isInteger(brandId) ||
            brandId <= 0) {
            throw new Error("Invalid brand ID");
        }
        const brand = await brandService.deleteBrand(brandId);
        res.status(200).json({
            success: true,
            message: "Brand deactivated successfully",
            data: brand,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBrand = deleteBrand;
