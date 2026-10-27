import { adminApi } from "./admin.api";

// ========================================
// Product Variant
// ========================================

export interface ProductVariant {
  id?: number;
  name: string;
  value: string;
  sku: string;
  stock: number;
}

// ========================================
// Product Image
// ========================================

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
  productId: number;
}

// ========================================
// Product
// ========================================

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  sku: string;

  brandId: number | null;
  categoryId: number;

  price: number | string;
  costPrice:
    | number
    | string
    | null;

  isFeatured: boolean;
  isActive: boolean;

  category: {
    id: number;
    name: string;
  } | null;

  brand: {
    id: number;
    name: string;
  } | null;

  images: ProductImage[];

  variants: ProductVariant[];

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ========================================
// Create Product
// ========================================

export interface CreateProductInput {
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

  variants: ProductVariant[];
}

// ========================================
// Update Product
// ========================================

export type UpdateProductInput =
  Partial<CreateProductInput>;

// ========================================
// Product Image Update
// ========================================

export interface UpdateProductImageInput {
  altText?: string;
  displayOrder?: number;
}

// ========================================
// Get Products
// ========================================

export const getAdminProducts =
  async (): Promise<
    AdminProduct[]
  > => {
    return adminApi.get<
      AdminProduct[]
    >(
      "/admin/products",
    );
  };

// ========================================
// Get Product
// ========================================

export const getAdminProductById =
  async (
    id: number,
  ): Promise<AdminProduct> => {
    return adminApi.get<AdminProduct>(
      `/admin/products/${id}`,
    );
  };

// ========================================
// Create Product
// ========================================

export const createAdminProduct =
  async (
    data: CreateProductInput,
  ): Promise<AdminProduct> => {
    return adminApi.post<AdminProduct>(
      "/admin/products",
      data,
    );
  };

// ========================================
// Update Product
// ========================================

export const updateAdminProduct =
  async (
    id: number,
    data: UpdateProductInput,
  ): Promise<AdminProduct> => {
    return adminApi.patch<AdminProduct>(
      `/admin/products/${id}`,
      data,
    );
  };

// ========================================
// Delete Product
// ========================================

export const deleteAdminProduct =
  async (
    id: number,
  ): Promise<AdminProduct> => {
    return adminApi.delete<AdminProduct>(
      `/admin/products/${id}`,
    );
  };

// ========================================
// Upload Product Images
// ========================================

export const uploadProductImages =
  async (
    productId: number,
    files: File[],
  ): Promise<ProductImage[]> => {
    const formData =
      new FormData();

    files.forEach(
      (file) => {
        formData.append(
          "images",
          file,
        );
      },
    );

    return adminApi.post<
      ProductImage[]
    >(
      `/admin/products/${productId}/images`,
      formData,
    );
  };

// ========================================
// Update Product Image
// ========================================

export const updateProductImage =
  async (
    productId: number,
    imageId: number,
    data: UpdateProductImageInput,
  ): Promise<ProductImage> => {
    return adminApi.patch<ProductImage>(
      `/admin/products/${productId}/images/${imageId}`,
      data,
    );
  };

// ========================================
// Delete Product Image
// ========================================

export const deleteProductImage =
  async (
    productId: number,
    imageId: number,
  ): Promise<null> => {
    return adminApi.delete<null>(
      `/admin/products/${productId}/images/${imageId}`,
    );
  };

// ========================================
// Set Primary Product Image
// ========================================

export const setPrimaryProductImage =
  async (
    productId: number,
    imageId: number,
  ): Promise<ProductImage> => {
    return adminApi.patch<ProductImage>(
      `/admin/products/${productId}/images/${imageId}/primary`,
    );
  };

// ========================================
// Convert backend image path
// into a browser-accessible URL
// ========================================

export const getProductImageUrl = (
  imageUrl: string,
): string => {
  if (
    imageUrl.startsWith(
      "http://",
    ) ||
    imageUrl.startsWith(
      "https://",
    )
  ) {
    return imageUrl;
  }

  const apiBase =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

  const backendOrigin =
    apiBase.replace(
      /\/api\/?$/,
      "",
    );

  return `${backendOrigin}${
    imageUrl.startsWith("/")
      ? imageUrl
      : `/${imageUrl}`
  }`;
};