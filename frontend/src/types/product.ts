export interface ProductImage {
  id: number;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
  productId: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  value: string;
  sku: string;
  stock: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProductBrand {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  sku: string;

  brandId: number | null;
  categoryId: number;

  price: number;
  costPrice: number | null;

  isFeatured: boolean;
  isActive: boolean;

  category: ProductCategory;
  brand: ProductBrand | null;

  images: ProductImage[];
  variants: ProductVariant[];

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}