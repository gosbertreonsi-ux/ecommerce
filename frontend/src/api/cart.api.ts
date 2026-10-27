import type { Product } from "../types/product";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface BackendCartVariant {
  id: number;
  name: string;
  value: string;
  sku: string;
  stock: number;
  productId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCartItem {
  id: number;
  quantity: number;
  productId: number;
  variantId: number | null;
  product: Product;
  variant: BackendCartVariant | null;
}

export interface BackendCart {
  id: number;
  userId: number;
  items: BackendCartItem[];
}

const getHeaders = (
  token: string,
) => ({
  "Content-Type": "application/json",
  Authorization:
    `Bearer ${token}`,
});

export const getCart = async (
  token: string,
): Promise<BackendCart> => {
  const response =
    await fetch(
      `${API_URL}/cart`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      },
    );

  const result =
    (await response.json()) as
      ApiResponse<BackendCart>;

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to fetch cart",
    );
  }

  if (!result.data) {
    throw new Error(
      "Cart response did not contain data",
    );
  }

  return {
    ...result.data,
    items:
      Array.isArray(
        result.data.items,
      )
        ? result.data.items
        : [],
  };
};

export const addCartItem = async (
  token: string,
  productId: number,
  variantId: number,
  quantity = 1,
) => {
  const response =
    await fetch(
      `${API_URL}/cart/items`,
      {
        method: "POST",
        headers:
          getHeaders(token),
        body:
          JSON.stringify({
            productId,
            variantId,
            quantity,
          }),
      },
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to add item to cart",
    );
  }

  return result.data;
};

export const updateCartItem = async (
  token: string,
  variantId: number,
  quantity: number,
) => {
  const response =
    await fetch(
      `${API_URL}/cart/items/${variantId}`,
      {
        method: "PATCH",
        headers:
          getHeaders(token),
        body:
          JSON.stringify({
            quantity,
          }),
      },
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to update cart item",
    );
  }

  return result.data;
};

export const removeCartItem = async (
  token: string,
  variantId: number,
) => {
  const response =
    await fetch(
      `${API_URL}/cart/items/${variantId}`,
      {
        method: "DELETE",
        headers:
          getHeaders(token),
      },
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to remove item from cart",
    );
  }

  return result;
};

export const clearBackendCart =
  async (
    token: string,
  ) => {
    const response =
      await fetch(
        `${API_URL}/cart`,
        {
          method: "DELETE",
          headers:
            getHeaders(token),
        },
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to clear cart",
      );
    }

    return result;
  };