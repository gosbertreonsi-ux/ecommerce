"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImage = uploadProductImage;
exports.managedImagePublicId = managedImagePublicId;
exports.deleteManagedCloudImage = deleteManagedCloudImage;
const cloudinary_1 = require("cloudinary");
const node_crypto_1 = require("node:crypto");
const sharp_1 = __importDefault(require("sharp"));
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const MAX_INPUT_PIXELS = 32_000_000;
const MAX_EDGE = 2000;
const ALLOWED_RASTER_FORMATS = new Set([
    "jpeg", "png", "webp", "gif", "tiff", "heif", "avif",
]);
/** Credentials must exist on the backend ONLY, not in VITE_ variables. */
function configuredCloudinary() {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud_name || !api_key || !api_secret) {
        throw new Error("Image storage is not configured. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on the Render backend.");
    }
    cloudinary_1.v2.config({ cloud_name, api_key, api_secret, secure: true });
    return cloudinary_1.v2;
}
function checkPixels(width, height) {
    if (!width || !height || width <= 0 || height <= 0 || width * height > MAX_INPUT_PIXELS) {
        throw new Error("Image dimensions are invalid or too large (maximum 32 megapixels).");
    }
}
/** BMP is not supported in sharp's standard prebuilt binaries; decode it explicitly. */
function decodeBmp(buffer) {
    if (buffer.length < 54)
        throw new Error("Invalid BMP image.");
    const width = buffer.readInt32LE(18);
    const height = Math.abs(buffer.readInt32LE(22));
    checkPixels(width, height);
    // The package's pixels are ABGR; sharp expects RGBA.
    const bmp = require("bmp-js");
    const decoded = bmp.decode(buffer);
    checkPixels(decoded.width, decoded.height);
    const source = decoded.data;
    if (source.length !== decoded.width * decoded.height * 4) {
        throw new Error("Invalid BMP image pixel data.");
    }
    const rgba = Buffer.allocUnsafe(source.length);
    for (let i = 0; i < source.length; i += 4) {
        rgba[i] = source[i + 3];
        rgba[i + 1] = source[i + 2];
        rgba[i + 2] = source[i + 1];
        rgba[i + 3] = source[i];
    }
    return {
        buffer: rgba,
        raw: { width: decoded.width, height: decoded.height, channels: 4 },
    };
}
function isBmp(data) {
    return data.length > 2 && data.subarray(0, 2).toString("ascii") === "BM";
}
function isHeic(data) {
    if (data.length < 12 || data.subarray(4, 8).toString("ascii") !== "ftyp")
        return false;
    const brand = data.subarray(8, 12).toString("ascii");
    return ["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1"].includes(brand);
}
/**
 * Convert common raster formats to safe, browser-friendly WebP.
 * Handles JPEG, PNG, WebP, GIF (first frame), TIFF, AVIF,
 * BMP, and HEIC/HEIF (first image with heic-convert).
 * Rejects SVG, PDFs, videos, non-image files, and oversized images.
 */
async function normalizeImage(file) {
    if (!file.buffer?.length)
        throw new Error("The selected image file is empty.");
    if (file.buffer.length > MAX_INPUT_BYTES) {
        throw new Error("Image exceeds 10 MB. Choose a smaller image.");
    }
    try {
        let processor;
        if (isBmp(file.buffer)) {
            const bmp = decodeBmp(file.buffer);
            processor = (0, sharp_1.default)(bmp.buffer, { raw: bmp.raw, limitInputPixels: MAX_INPUT_PIXELS });
        }
        else {
            let input = file.buffer;
            if (isHeic(input)) {
                // The default sharp binaries may not decode HEVC-based iPhone HEIC.
                // heic-convert provides a separate decoder for these files.
                const heicConvert = require("heic-convert");
                input = Buffer.from(await heicConvert({ buffer: input, format: "JPEG", quality: 0.9 }));
            }
            processor = (0, sharp_1.default)(input, {
                failOn: "warning",
                limitInputPixels: MAX_INPUT_PIXELS,
                pages: 1,
            });
            const metadata = await processor.metadata();
            if (!metadata.format || !ALLOWED_RASTER_FORMATS.has(metadata.format)) {
                throw new Error("Unsupported image format. Upload a raster photo, not SVG, PDF or another file type.");
            }
            checkPixels(metadata.width, metadata.height);
        }
        // Strip EXIF/location metadata, respect EXIF rotation, resize without cropping.
        return await processor
            .rotate()
            .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 86, effort: 4 })
            .toBuffer();
    }
    catch (error) {
        if (error instanceof Error && (error.message.startsWith("Image dimensions") ||
            error.message.startsWith("Unsupported image") ||
            error.message.startsWith("Invalid BMP")))
            throw error;
        console.error("[IMAGE_DECODE_FAILED]", error instanceof Error ? error.message : "Unknown decoder error");
        throw new Error(`Cannot read ${file.originalname}. Use a valid JPEG, PNG, WebP, GIF, TIFF, AVIF, BMP or HEIC image.`);
    }
}
async function uploadProductImage(file) {
    // Never send original/untrusted image bytes to storage.
    const normalized = await normalizeImage(file);
    const provider = configuredCloudinary();
    return new Promise((resolve, reject) => {
        const stream = provider.uploader.upload_stream({
            folder: "eshop/products",
            public_id: (0, node_crypto_1.randomUUID)(),
            format: "webp",
            overwrite: false,
            resource_type: "image",
            type: "upload",
        }, (error, result) => {
            if (error)
                return reject(new Error(error.message || "Cloudinary upload failed"));
            if (!result?.secure_url || !result.public_id) {
                return reject(new Error("Cloudinary did not return an image URL."));
            }
            resolve({ url: result.secure_url, publicId: result.public_id });
        });
        stream.on("error", reject);
        stream.end(normalized);
    });
}
/** Only allow deletion of assets uploaded by this application. */
function managedImagePublicId(imageUrl) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName)
        return null;
    try {
        const url = new URL(imageUrl);
        if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com")
            return null;
        const prefix = `/${cloudName}/image/upload/`;
        const pathname = decodeURIComponent(url.pathname);
        if (!pathname.startsWith(prefix))
            return null;
        const asset = pathname.slice(prefix.length);
        const match = /^v\d+\/(eshop\/products\/[a-f0-9-]{36})\.(?:jpe?g|png|webp|gif|avif)$/i.exec(asset);
        return match?.[1] ?? null;
    }
    catch {
        return null;
    }
}
async function deleteManagedCloudImage(publicId) {
    const provider = configuredCloudinary();
    const result = await provider.uploader.destroy(publicId, {
        resource_type: "image",
        type: "upload",
        invalidate: true,
    });
    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }
}
