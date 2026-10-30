import multer from "multer";

// In-memory upload: never write images to Render's ephemeral filesystem.
// The existing admin route already requires authentication + ADMIN role.
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
    return;
  }
  cb(null, true);
};

export const productImageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
    parts: 12,
  },
});
