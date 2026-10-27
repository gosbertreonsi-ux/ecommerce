import apiClient from "./client";


/*
|--------------------------------------------------------------------------
| REVIEW STATUS
|--------------------------------------------------------------------------
*/

export type ReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";


/*
|--------------------------------------------------------------------------
| CUSTOMER REVIEW
|--------------------------------------------------------------------------
*/

export interface CustomerReview {
  id: number;

  rating: number;

  comment: string | null;

  status: ReviewStatus;

  userId: number;

  productId: number;

  createdAt: string;

  updatedAt: string;

  product?: {
    id: number;

    name: string;

    sku: string;

    slug: string;
  };
}


/*
|--------------------------------------------------------------------------
| CREATE REVIEW DATA
|--------------------------------------------------------------------------
*/

export interface CreateReviewData {
  orderId: number;

  productId: number;

  rating: number;

  comment?: string | null;
}


/*
|--------------------------------------------------------------------------
| API RESPONSES
|--------------------------------------------------------------------------
*/

interface ReviewResponse {
  success: boolean;

  message?: string;

  data: CustomerReview;
}


interface ReviewsResponse {
  success: boolean;

  message?: string;

  data: CustomerReview[];
}


/*
|--------------------------------------------------------------------------
| GET MY REVIEWS
|--------------------------------------------------------------------------
*/

export const getMyReviews =
  async (
    token: string,
  ): Promise<CustomerReview[]> => {

    if (!token) {
      throw new Error(
        "Authentication token is required.",
      );
    }


    const response =
      await apiClient.get<ReviewsResponse>(
        "/reviews/my",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );


    return response.data.data;
  };


/*
|--------------------------------------------------------------------------
| CREATE REVIEW
|--------------------------------------------------------------------------
*/

export const createReview =
  async (
    token: string,
    data: CreateReviewData,
  ): Promise<CustomerReview> => {

    if (!token) {
      throw new Error(
        "Authentication token is required.",
      );
    }


    if (
      !Number.isInteger(
        data.orderId,
      ) ||
      data.orderId <= 0
    ) {
      throw new Error(
        "Invalid order ID.",
      );
    }


    if (
      !Number.isInteger(
        data.productId,
      ) ||
      data.productId <= 0
    ) {
      throw new Error(
        "Invalid product ID.",
      );
    }


    if (
      !Number.isInteger(
        data.rating,
      ) ||
      data.rating < 1 ||
      data.rating > 5
    ) {
      throw new Error(
        "Rating must be between 1 and 5.",
      );
    }


    const response =
      await apiClient.post<ReviewResponse>(
        "/reviews",
        data,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );


    return response.data.data;
  };