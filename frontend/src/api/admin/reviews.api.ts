import {
  adminApi,
} from "./admin.api";

export type ReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface AdminReview {
  id: number;
  rating: number;
  comment: string | null;
  status: ReviewStatus;

  userId: number;
  productId: number;

  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  product?: {
    id: number;
    name: string;
    sku: string;
    slug: string;

    images?: Array<{
      id: number;
      imageUrl: string;
      altText: string | null;
      isPrimary: boolean;
      displayOrder: number;
    }>;
  };

  createdAt: string;
  updatedAt: string;
}

export const getAdminReviews =
  async (
    status?: ReviewStatus,
  ): Promise<AdminReview[]> => {
    return adminApi.get<AdminReview[]>(
      "/admin/reviews",
      status
        ? { status }
        : undefined,
    );
  };

export const getAdminReview =
  async (
    id: number,
  ): Promise<AdminReview> => {
    return adminApi.get<AdminReview>(
      `/admin/reviews/${id}`,
    );
  };

export const updateAdminReviewStatus =
  async (
    id: number,
    status: ReviewStatus,
  ): Promise<AdminReview> => {
    return adminApi.patch<AdminReview>(
      `/admin/reviews/${id}/status`,
      { status },
    );
  };

export const deleteAdminReview =
  async (
    id: number,
  ): Promise<AdminReview> => {
    return adminApi.delete<AdminReview>(
      `/admin/reviews/${id}`,
    );
  };