import type { Product } from "../types/product";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

interface ProductsResponse {
  success: boolean;
  data: ProductApiResponse[];
}

interface ProductResponse {
  success: boolean;
  data: ProductApiResponse;
}

interface ProductApiResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  sku: string;

  brandId: number | null;
  categoryId: number;

  price: string | number;
  costPrice: string | number | null;

  isFeatured: boolean;
  isActive: boolean;

  category: Product["category"];
  brand: Product["brand"];

  images: Product["images"];
  variants: Product["variants"];

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const mapProduct = (
  product: ProductApiResponse,
): Product => {
  return {
    id: product.id,

    name: product.name,

    slug: product.slug,

    description: product.description,

    sku: product.sku,

    brandId: product.brandId,

    categoryId: product.categoryId,

    price: Number(product.price),

    costPrice:
      product.costPrice === null
        ? null
        : Number(product.costPrice),

    isFeatured: product.isFeatured,

    isActive: product.isActive,

    category: product.category,

    brand: product.brand,

    images: product.images ?? [],

    variants: product.variants ?? [],

    createdAt: product.createdAt,

    updatedAt: product.updatedAt,

    deletedAt: product.deletedAt,
  };
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(
    `${API_URL}/products`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load products",
    );
  }

  const result: ProductsResponse =
    await response.json();

  if (!result.success) {
    throw new Error(
      "Failed to load products",
    );
  }

  return result.data.map(mapProduct);
};

export const getProduct = async (
  id: number,
): Promise<Product> => {
  const response = await fetch(
    `${API_URL}/products/${id}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "Product not found",
      );
    }

    throw new Error(
      "Failed to load product",
    );
  }

  const result: ProductResponse =
    await response.json();

  if (!result.success) {
    throw new Error(
      "Failed to load product",
    );
  }

  return mapProduct(result.data);
};