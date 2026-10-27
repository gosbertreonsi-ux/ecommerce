import {
  adminApi,
} from "./admin.api";

export interface LowStockProduct {
  id: number;

  name: string;

  value: string;

  sku: string;

  stock: number;

  product: {
    id: number;

    name: string;

    sku: string;

    isActive: boolean;
  };
}

export interface AdminDashboardStats {
  overview: {
    totalCustomers: number;

    totalProducts: number;

    totalOrders: number;

    totalRevenue: number | string;
  };

  orders: {
    pending: number;

    paid: number;

    processing: number;

    shipped: number;

    delivered: number;

    cancelled: number;
  };

  payments: {
    pending: number;

    successful: number;

    failed: number;
  };

  inventory: {
    lowStockCount: number;

    lowStockProducts: LowStockProduct[];
  };
}

export const getAdminDashboardStats =
  async (): Promise<AdminDashboardStats> => {
    return adminApi.get<AdminDashboardStats>(
      "/admin/dashboard",
    );
  };