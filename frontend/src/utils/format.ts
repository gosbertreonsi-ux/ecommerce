import type { SyntheticEvent } from "react";

const FALLBACK_API_URL = "http://localhost:5000/api";

export const IMAGE_PLACEHOLDER = "https://placehold.co/800x800?text=No+Image";

interface ImageLike {
  imageUrl: string;
  isPrimary?: boolean;
}

/** Turns a stored image path into an absolute URL served by the backend. */
export function getProductImageUrl(imageUrl: string): string {
  if (/^https?:\/\//.test(imageUrl)) {
    return imageUrl;
  }

  const apiBase = import.meta.env.VITE_API_URL || FALLBACK_API_URL;
  const backendOrigin = apiBase.replace(/\/api\/?$/, "");

  return `${backendOrigin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

/** The primary image if there is one, otherwise the first image. */
export function pickImage<T extends ImageLike>(
  images?: readonly T[] | null,
): T | undefined {
  return images?.find((image) => image.isPrimary) ?? images?.[0];
}

/** Absolute URL of the best image, or the placeholder when there are none. */
export function getPrimaryImageUrl(images?: readonly ImageLike[] | null): string {
  const image = pickImage(images);

  return image ? getProductImageUrl(image.imageUrl) : IMAGE_PLACEHOLDER;
}

/** `onError` handler for <img>. Clearing onerror stops a failing placeholder from looping. */
export function swapToPlaceholder(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;

  image.onerror = null;
  image.src = IMAGE_PLACEHOLDER;
}

export function formatTZS(value: number | string): string {
  return `TZS ${Number(value).toLocaleString()}`;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash on delivery",
  CARD: "Card",
  MOBILE_MONEY: "Mobile money",
};

export function paymentMethodLabel(method?: string | null): string {
  return (method && PAYMENT_METHOD_LABELS[method]) || "Unavailable";
}