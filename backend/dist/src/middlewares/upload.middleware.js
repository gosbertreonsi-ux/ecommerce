"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productImageUpload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const multer_1 = __importDefault(require("multer"));
const uploadDirectory = path_1.default.resolve(process.cwd(), "uploads", "products");
fs_1.default.mkdirSync(uploadDirectory, {
    recursive: true,
});
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (_req, file, cb) => {
        const extension = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${crypto_1.default.randomUUID()}${extension}`;
        cb(null, uniqueName);
    },
});
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
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
    },
});
