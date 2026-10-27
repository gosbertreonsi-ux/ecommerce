import {
  adminApi,
} from "./admin.api";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface AdminOrder {
  id: number;
  orderNumber: string;
  total: number | string;
  status: OrderStatus;

  userId: number;

  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  items: Array<{
    id: number;
    quantity: number;
    price: number | string;

    product?: {
      id: number;
      name: string;
      sku: string;
    };
  }>;

  payment?: {
    id: number;
    amount: number | string;
    method:
      | "CASH"
      | "CARD"
      | "MOBILE_MONEY";
    status:
      | "PENDING"
      | "SUCCESS"
      | "FAILED"
      | "REFUNDED";
    transactionId: string | null;
  } | null;

  shippingLabel: string | null;
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingRegion: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;

  createdAt: string;
  updatedAt: string;
}

export const getAdminOrders =
  async (): Promise<AdminOrder[]> => {
    return adminApi.get<AdminOrder[]>(
      "/admin/orders",
    );
  };

export const getAdminOrder =
  async (
    id: number,
  ): Promise<AdminOrder> => {
    return adminApi.get<AdminOrder>(
      `/admin/orders/${id}`,
    );
  };

export const updateAdminOrderStatus =
  async (
    id: number,
    status: OrderStatus,
  ): Promise<AdminOrder> => {
    return adminApi.patch<AdminOrder>(
      `/admin/orders/${id}/status`,
      { status },
    );
  };