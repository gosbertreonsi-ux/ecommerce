import {
  adminApi,
} from "./admin.api";

export interface AdminBrand {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandInput {
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export type UpdateBrandInput =
  Partial<CreateBrandInput>;

export const getAdminBrands =
  async (): Promise<AdminBrand[]> => {
    return adminApi.get<AdminBrand[]>(
      "/admin/brands",
    );
  };

export const getAdminBrand =
  async (
    id: number,
  ): Promise<AdminBrand> => {
    return adminApi.get<AdminBrand>(
      `/admin/brands/${id}`,
    );
  };

export const createAdminBrand =
  async (
    data: CreateBrandInput,
  ): Promise<AdminBrand> => {
    return adminApi.post<AdminBrand>(
      "/admin/brands",
      data,
    );
  };

export const updateAdminBrand =
  async (
    id: number,
    data: UpdateBrandInput,
  ): Promise<AdminBrand> => {
    return adminApi.patch<AdminBrand>(
      `/admin/brands/${id}`,
      data,
    );
  };

export const deleteAdminBrand =
  async (
    id: number,
  ): Promise<AdminBrand> => {
    return adminApi.delete<AdminBrand>(
      `/admin/brands/${id}`,
    );
  };
