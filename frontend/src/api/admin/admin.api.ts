import apiClient from "../client";

export interface AdminApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const adminApi = {
  // ========================================
  // GET
  // ========================================

  get: async <T>(
    url: string,
    params?: Record<string, unknown>,
  ): Promise<T> => {
    const response =
      await apiClient.get<
        AdminApiResponse<T>
      >(url, {
        params,
      });

    return response.data.data;
  },

  // ========================================
  // POST
  // ========================================

  post: async <T>(
    url: string,
    data?: unknown,
  ): Promise<T> => {
    const isFormData =
      typeof FormData !== "undefined" &&
      data instanceof FormData;

    const response =
      await apiClient.post<
        AdminApiResponse<T>
      >(
        url,
        data,
        isFormData
          ? {
              headers: {
                "Content-Type":
                  undefined,
              },
            }
          : undefined,
      );

    return response.data.data;
  },

  // ========================================
  // PATCH
  // ========================================

  patch: async <T>(
    url: string,
    data?: unknown,
  ): Promise<T> => {
    const isFormData =
      typeof FormData !== "undefined" &&
      data instanceof FormData;

    const response =
      await apiClient.patch<
        AdminApiResponse<T>
      >(
        url,
        data,
        isFormData
          ? {
              headers: {
                "Content-Type":
                  undefined,
              },
            }
          : undefined,
      );

    return response.data.data;
  },

  // ========================================
  // DELETE
  // ========================================

  delete: async <T>(
    url: string,
  ): Promise<T> => {
    const response =
      await apiClient.delete<
        AdminApiResponse<T>
      >(url);

    return response.data.data;
  },
};