import multer from "multer";

/**
 * Do not trust the browser-provided MIME type or the filename extension.
 * The Cloudinary image utility decodes each upload, verifies it is a raster
 * image, and normalizes it to WebP before any bytes reach Cloudinary.
 *
 * Only the existing authenticated ADMIN routes use this middleware.
 */
export const productImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per original file
    files: 10,
    parts: 12,
  },
});
