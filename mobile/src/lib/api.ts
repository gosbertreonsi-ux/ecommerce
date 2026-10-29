import type { Product, ProductApi, ProductImage } from "../types/product";

/**
 * IMPORTANT: this environment variable is compiled into the mobile app.
 * On a physical phone, use the COMPUTER's LAN IP, not localhost.
 * Only public routing information belongs in EXPO_PUBLIC_ variables.
 */
export function getApiBaseUrl(): string {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!value) {
    throw new Error(
      "API not configured. Set EXPO_PUBLIC_API_URL in mobile/.env to http://YOUR_PC_IP:5000/api, then restart Expo.",
    );
  }
  return value.replace(/\/+$/, "");
}

export function productImageUrl(imageUrl: string): string {
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const origin = getApiBaseUrl().replace(/\/api\/?$/, "");
  return `${origin}/${imageUrl.replace(/^\/+/, "")}`;
}

export function getOrderedImages(images: readonly ProductImage[]): ProductImage[] {
  const sorted = [...images].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.id - b.id,
  );
  const cover = sorted.find((image) => image.isPrimary) ?? sorted[0];
  return cover ? [cover, ...sorted.filter((image) => image.id !== cover.id)] : [];
}

type ApiResponse<T> = { success: boolean; data: T; message?: string };

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`E-Shop API error (${response.status}). Check the backend and your Wi-Fi connection.`);
  }
  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.success) throw new Error(payload.message ?? "E-Shop request failed.");
  return payload.data;
}

function normalize(product: ProductApi): Product {
  return {
    ...product,
    price: Number(product.price),
    images: product.images ?? [],
    variants: product.variants ?? [],
  };
}

export async function getProducts(): Promise<Product[]> {
  const data = await request<ProductApi[]>("/products");
  return data.map(normalize);
}

export async function getProduct(id: number): Promise<Product> {
  const data = await request<ProductApi>(`/products/${id}`);
  return normalize(data);
}
