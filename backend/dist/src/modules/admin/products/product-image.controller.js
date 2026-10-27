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
exports.setPrimaryImage = exports.deleteImage = exports.updateImage = exports.uploadImages = void 0;
const zod_1 = require("zod");
const productImageService = __importStar(require("./product-image.service"));
const updateImageSchema = zod_1.z.object({
    altText: zod_1.z
        .string()
        .max(500, "Alt text must be 500 characters or less.")
        .optional(),
    displayOrder: zod_1.z
        .number()
        .int()
        .positive()
        .optional(),
});
const uploadImages = async (req, res, next) => {
    try {
        const productId = Number(req.params.id);
        if (!Number.isInteger(productId) ||
            productId <= 0) {
            throw new Error("Invalid product ID");
        }
        const files = req.files;
        if (!files ||
            files.length === 0) {
            throw new Error("No images were uploaded");
        }
        const images = await productImageService.addImages(productId, files);
        res.status(201).json({
            success: true,
            message: "Product images uploaded successfully",
            data: images,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadImages = uploadImages;
const updateImage = async (req, res, next) => {
    try {
        const productId = Number(req.params.id);
        const imageId = Number(req.params.imageId);
        if (!Number.isInteger(productId) ||
            productId <= 0) {
            throw new Error("Invalid product ID");
        }
        if (!Number.isInteger(imageId) ||
            imageId <= 0) {
            throw new Error("Invalid image ID");
        }
        const data = updateImageSchema.parse(req.body);
        const image = await productImageService.updateImage(productId, imageId, data);
        res.status(200).json({
            success: true,
            message: "Product image updated successfully",
            data: image,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateImage = updateImage;
const deleteImage = async (req, res, next) => {
    try {
        const productId = Number(req.params.id);
        const imageId = Number(req.params.imageId);
        if (!Number.isInteger(productId) ||
            productId <= 0) {
            throw new Error("Invalid product ID");
        }
        if (!Number.isInteger(imageId) ||
            imageId <= 0) {
            throw new Error("Invalid image ID");
        }
        const result = await productImageService.deleteImage(productId, imageId);
        res.status(200).json({
            success: true,
            message: result.message,
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteImage = deleteImage;
const setPrimaryImage = async (req, res, next) => {
    try {
        const productId = Number(req.params.id);
        const imageId = Number(req.params.imageId);
        if (!Number.isInteger(productId) ||
            productId <= 0) {
            throw new Error("Invalid product ID");
        }
        if (!Number.isInteger(imageId) ||
            imageId <= 0) {
            throw new Error("Invalid image ID");
        }
        const image = await productImageService.setPrimaryImage(productId, imageId);
        res.status(200).json({
            success: true,
            message: "Primary image updated successfully",
            data: image,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.setPrimaryImage = setPrimaryImage;
