import {
  adminApi,
} from "./admin.api";

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
}

export type UpdateCategoryInput =
  Partial<CreateCategoryInput>;

export const getAdminCategories =
  async (): Promise<AdminCategory[]> => {
    return adminApi.get<AdminCategory[]>(
      "/admin/categories",
    );
  };

export const getAdminCategory =
  async (
    id: number,
  ): Promise<AdminCategory> => {
    return adminApi.get<AdminCategory>(
      `/admin/categories/${id}`,
    );
  };

export const createAdminCategory =
  async (
    data: CreateCategoryInput,
  ): Promise<AdminCategory> => {
    return adminApi.post<AdminCategory>(
      "/admin/categories",
      data,
    );
  };

export const updateAdminCategory =
  async (
    id: number,
    data: UpdateCategoryInput,
  ): Promise<AdminCategory> => {
    return adminApi.patch<AdminCategory>(
      `/admin/categories/${id}`,
      data,
    );
  };

export const deleteAdminCategory =
  async (
    id: number,
  ): Promise<AdminCategory> => {
    return adminApi.delete<AdminCategory>(
      `/admin/categories/${id}`,
    );
  };
