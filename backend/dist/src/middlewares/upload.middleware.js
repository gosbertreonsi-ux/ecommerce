"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
/**
 * Do not trust the browser-provided MIME type or the filename extension.
 * The Cloudinary image utility decodes each upload, verifies it is a raster
 * image, and normalizes it to WebP before any bytes reach Cloudinary.
 *
 * Only the existing authenticated ADMIN routes use this middleware.
 */
exports.productImageUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per original file
        files: 10,
        parts: 12,
    },
});
