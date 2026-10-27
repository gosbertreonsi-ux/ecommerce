import type {
  CartItem,
} from "../stores/cartStore";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "MOBILE_MONEY";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";


export interface OrderProductImage {
  id: number;
  imageUrl: string;
  altText?: string | null;
  isPrimary?: boolean;
  displayOrder?: number;
}


export interface OrderProductVariant {
  id: number;
  name: string;
  value: string;
  sku: string;
  stock?: number;
}


export interface OrderProduct {
  id: number;
  name: string;
  sku: string;
  price: number | string;
  images?: OrderProductImage[];
  variants?: OrderProductVariant[];
}


export interface OrderItem {
  id: number;
  quantity: number;
  price: number | string;
  orderId: number;
  productId: number;

  /*
  |----------------------------------------------------------
  | EXACT PRODUCT VARIANT
  |----------------------------------------------------------
  */

  variantId: number | null;

  variant?: OrderProductVariant | null;

  product?: OrderProduct | null;

  updatedAt?: string;
  deletedAt?: string | null;
}


export interface OrderAddress {
  id: number;
  label: string;
  street: string;
  city: string;
  region: string;
  postalCode?: string | null;
  country: string;
}


export interface OrderPayment {
  id: number;
  status?: PaymentStatus;
  amount?: number | string;
  method?: PaymentMethod;
  transactionId?: string | null;
}


export interface Order {
  id: number;
  orderNumber: string;
  total: number | string;
  status: string;
  userId?: number;

  shippingLabel?: string | null;
  shippingStreet?: string | null;
  shippingCity?: string | null;
  shippingRegion?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;

  address?: OrderAddress | null;

  items?: OrderItem[];

  payment?: OrderPayment | null;
}


export interface CreateOrderResponse {
  success: boolean;
  message: string;

  data: {
    id: number;
    orderNumber: string;
    total: number | string;
    status: string;

    shippingLabel?: string | null;
    shippingStreet?: string | null;
    shippingCity?: string | null;
    shippingRegion?: string | null;
    shippingPostalCode?: string | null;
    shippingCountry?: string | null;

    items?: OrderItem[];

    payment?: OrderPayment | null;
  };
}


export interface GetMyOrdersResponse {
  success: boolean;
  message?: string;
  data: Order[];
}


export interface GetOrderByIdResponse {
  success: boolean;
  message?: string;
  data: Order;
}


/*
|--------------------------------------------------------------------------|
| CREATE ORDER
|--------------------------------------------------------------------------|
*/

export const createOrder = async (
  token: string,
  addressId: number,
  items: CartItem[],
  paymentMethod: PaymentMethod,
): Promise<CreateOrderResponse> => {
  if (!token) {
    throw new Error(
      "Authentication token is required",
    );
  }

  if (!addressId) {
    throw new Error(
      "Shipping address is required",
    );
  }

  if (!items.length) {
    throw new Error(
      "Your cart is empty",
    );
  }

  /*
  |----------------------------------------------------------
  | VALIDATE EXACT VARIANTS
  |----------------------------------------------------------
  */

  for (const item of items) {
    if (
      !Number.isInteger(
        item.variantId,
      ) ||
      item.variantId <= 0
    ) {
      throw new Error(
        `Product "${item.product.name}" does not have a valid variant selected.`,
      );
    }

    if (
      !Number.isInteger(
        item.quantity,
      ) ||
      item.quantity <= 0
    ) {
      throw new Error(
        `Invalid quantity for "${item.product.name}".`,
      );
    }
  }

  /*
  |----------------------------------------------------------
  | SEND ORDER
  |----------------------------------------------------------
  */

  const response =
    await fetch(
      `${API_URL}/orders`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            addressId,

            paymentMethod,

            items: items.map(
              (item) => ({
                productId:
                  item.product.id,

                variantId:
                  item.variantId,

                quantity:
                  item.quantity,
              }),
            ),
          }),
      },
    );

  const result:
    unknown =
    await response.json();

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message ===
        "string"
        ? result.message
        : "Failed to create order";

    throw new Error(message);
  }

  return result as CreateOrderResponse;
};


/*
|--------------------------------------------------------------------------|
| GET MY ORDERS
|--------------------------------------------------------------------------|
*/

export const getMyOrders =
  async (
    token: string,
  ): Promise<GetMyOrdersResponse> => {
    if (!token) {
      throw new Error(
        "Authentication token is required",
      );
    }

    const response =
      await fetch(
        `${API_URL}/orders`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

    const result:
      unknown =
      await response.json();

    if (!response.ok) {
      const message =
        typeof result === "object" &&
        result !== null &&
        "message" in result &&
        typeof result.message ===
          "string"
          ? result.message
          : "Failed to fetch orders";

      throw new Error(message);
    }

    return result as GetMyOrdersResponse;
  };


/*
|--------------------------------------------------------------------------|
| GET ORDER BY ID
|--------------------------------------------------------------------------|
*/

export const getOrderById =
  async (
    token: string,
    orderId: number,
  ): Promise<GetOrderByIdResponse> => {
    if (!token) {
      throw new Error(
        "Authentication token is required",
      );
    }

    if (
      !Number.isInteger(
        orderId,
      ) ||
      orderId <= 0
    ) {
      throw new Error(
        "Invalid order ID",
      );
    }

    const response =
      await fetch(
        `${API_URL}/orders/${orderId}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

    const result:
      unknown =
      await response.json();

    if (!response.ok) {
      const message =
        typeof result === "object" &&
        result !== null &&
        "message" in result &&
        typeof result.message ===
          "string"
          ? result.message
          : "Failed to fetch order";

      throw new Error(message);
    }

    return result as GetOrderByIdResponse;
  };