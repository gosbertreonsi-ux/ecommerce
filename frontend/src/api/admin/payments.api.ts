import {
  adminApi,
} from "./admin.api";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "MOBILE_MONEY";

export interface AdminPayment {
  id: number;
  amount: number | string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  orderId: number;

  order?: {
    id: number;
    orderNumber: string;
    total: number | string;
    status: string;

    user?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };

  createdAt: string;
  updatedAt: string;
}

export const getAdminPayments =
  async (): Promise<AdminPayment[]> => {
    return adminApi.get<AdminPayment[]>(
      "/admin/payments",
    );
  };

export const getAdminPayment =
  async (
    id: number,
  ): Promise<AdminPayment> => {
    return adminApi.get<AdminPayment>(
      `/admin/payments/${id}`,
    );
  };

export const updateAdminPaymentStatus =
  async (
    id: number,
    status: PaymentStatus,
  ): Promise<AdminPayment> => {
    return adminApi.patch<AdminPayment>(
      `/admin/payments/${id}/status`,
      { status },
    );
  };