"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
// In-memory upload: never write images to Render's ephemeral filesystem.
// The existing admin route already requires authentication + ADMIN role.
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);
const fileFilter = (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
        cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
        return;
    }
    cb(null, true);
};
exports.productImageUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
        parts: 12,
    },
});
