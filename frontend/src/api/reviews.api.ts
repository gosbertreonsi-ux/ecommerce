const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export type ReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface CustomerReview {
  id: number;
  rating: number;
  comment: string | null;
  status: ReviewStatus;

  userId: number;
  productId: number;

  product?: {
    id: number;
    name: string;
    sku: string;
    slug: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewInput {
  orderId: number;
  productId: number;
  rating: number;
  comment?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const createReview = async (
  token: string,
  data: CreateReviewInput,
): Promise<CustomerReview> => {
  const response = await fetch(
    `${API_URL}/reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );

  const result: ApiResponse<CustomerReview> =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to submit review",
    );
  }

  return result.data;
};

export const getMyReviews = async (
  token: string,
): Promise<CustomerReview[]> => {
  const response = await fetch(
    `${API_URL}/reviews/my`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result: ApiResponse<CustomerReview[]> =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to fetch reviews",
    );
  }

  return result.data;
};