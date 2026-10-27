import {
  adminApi,
} from "./admin.api";

export interface AdminCustomer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;

  updatedAt?: string;

  _count?: {
    orders: number;
    reviews: number;
  };

  orders?: Array<{
    id?: number;
    total: number | string;
  }>;

  addresses?: Array<{
    id: number;
    label: string;
    street: string;
    city: string;
    region: string;
    postalCode: string | null;
    country: string;
    isDefault: boolean;
  }>;

  reviews?: Array<{
    id: number;
    rating: number;
    comment: string | null;
    status: string;

    product?: {
      id: number;
      name: string;
    };
  }>;
}

export const getAdminCustomers =
  async (
    search?: string,
  ): Promise<AdminCustomer[]> => {
    return adminApi.get<AdminCustomer[]>(
      "/admin/customers",
      search
        ? { search }
        : undefined,
    );
  };

export const getAdminCustomer =
  async (
    id: number,
  ): Promise<AdminCustomer> => {
    return adminApi.get<AdminCustomer>(
      `/admin/customers/${id}`,
    );
  };

export const updateAdminCustomerStatus =
  async (
    id: number,
    isActive: boolean,
  ): Promise<AdminCustomer> => {
    return adminApi.patch<AdminCustomer>(
      `/admin/customers/${id}/status`,
      { isActive },
    );
  };