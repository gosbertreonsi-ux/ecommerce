import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

const uploadDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "products",
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (
    _req,
    _file,
    cb,
  ) => {
    cb(null, uploadDirectory);
  },

  filename: (
    _req,
    file,
    cb,
  ) => {
    const extension =
      path.extname(file.originalname).toLowerCase();

    const uniqueName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  },
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb,
) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(
      new Error(
        "Only JPEG, PNG, WebP, and GIF images are allowed.",
      ),
    );

    return;
  }

  cb(null, true);
};

export const productImageUpload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});