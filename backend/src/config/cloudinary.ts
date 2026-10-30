import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";

/**
 * Cloudinary credentials are read only when an admin uploads/deletes images.
 * Keeping the config lazy allows the existing catalog API to stay online
 * while credentials are being set up on Render.
 */
export function configuredCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Product image storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the backend.",
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  return cloudinary;
}

export interface CloudImage {
  url: string;
  publicId: string;
}

/** Verify the image header instead of trusting the browser-supplied MIME type. */
function validateImageContent(file: Express.Multer.File) {
  const b = file.buffer;
  if (!b || b.length < 12) throw new Error("Empty or invalid image");

  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const gif = b.subarray(0, 6).toString("ascii") === "GIF87a" || b.subarray(0, 6).toString("ascii") === "GIF89a";
  const webp = b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP";
  const valid =
    (file.mimetype === "image/jpeg" && jpeg) ||
    (file.mimetype === "image/png" && png) ||
    (file.mimetype === "image/gif" && gif) ||
    (file.mimetype === "image/webp" && webp);

  if (!valid) throw new Error("Image content does not match an allowed file type");
}

export async function uploadProductImage(file: Express.Multer.File): Promise<CloudImage> {
  validateImageContent(file);
  const provider = configuredCloudinary();

  return new Promise<CloudImage>((resolve, reject) => {
    const stream = provider.uploader.upload_stream(
      {
        folder: "eshop/products",
        public_id: randomUUID(),
        overwrite: false,
        resource_type: "image",
        type: "upload",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url || !result.public_id) {
          return reject(new Error("Cloudinary returned no image URL"));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.on("error", reject);
    stream.end(file.buffer);
  });
}

/**
 * Only recover IDs that our own upload path generated. This prevents
 * deleting another Cloudinary account's images or externally supplied URLs.
 */
export function managedImagePublicId(imageUrl: string): string | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;

  try {
    const url = new URL(imageUrl);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return null;
    const path = decodeURIComponent(url.pathname);
    const prefix = `/${cloudName}/image/upload/`;
    if (!path.startsWith(prefix)) return null;
    const suffix = path.slice(prefix.length);
    const match = /^v\d+\/(eshop\/products\/[a-f0-9-]{36})\.(?:jpe?g|png|webp|gif)$/i.exec(suffix);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function deleteManagedCloudImage(publicId: string): Promise<void> {
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
