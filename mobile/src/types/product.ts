/** Mirrors E-Shop's public /api/products payload (not its database schema). */
export interface ProductImage {
  id: number;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: number;
  name: string;
  value: string;
  sku: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  isFeatured: boolean;
  category: { id: number; name: string; slug: string };
  brand: { id: number; name: string } | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export type ProductApi = Omit<Product, "price"> & {
  price: number | string;
};
