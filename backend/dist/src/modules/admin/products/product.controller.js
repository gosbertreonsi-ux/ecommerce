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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const productService = __importStar(require("./product.service"));
const product_validation_1 = require("./product.validation");
const getProducts = async (_req, res, next) => {
    try {
        const products = await productService.getProducts();
        res.status(200).json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res, next) => {
    try {
        const productId = Number(req.params.id);
        if (!Number.isInteger(productId) ||
            productId <= 0) {
            throw new Error("Invalid product ID");
        }
        const product = await productService.getProductById(productId);
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res, next) => {
    try {
        const data = product_validation_1.createProductSchema.parse(req.body);
        const product = await productService.createProduct(data);
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const productId = Number(req.params.id);
        if (!Number.isInteger(productId) ||
            productId <= 0) {
            throw new Error("Invalid product ID");
        }
        const data = product_validation_1.updateProductSchema.parse(req.body);
        const product = await productService.updateProduct(productId, data);
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const productId = Number(req.params.id);
        if (!Number.isInteger(productId) ||
            productId <= 0) {
            throw new Error("Invalid product ID");
        }
        const product = await productService.deleteProduct(productId);
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
