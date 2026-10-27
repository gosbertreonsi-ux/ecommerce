const API_URL = "http://localhost:5000/api";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "MOBILE_MONEY";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export interface Payment {
  id: number;

  amount:
    number | string;

  method:
    PaymentMethod;

  status:
    PaymentStatus;

  transactionId?:
    string | null;

  orderId:
    number;

  createdAt?:
    string;

  updatedAt?:
    string;

  deletedAt?:
    string | null;
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface GetPaymentResponse {
  success: boolean;
  message?: string;
  data: Payment;
}

export interface SimulatePaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export const createPayment = async (
  token: string,
  orderId: number,
  method: PaymentMethod,
): Promise<CreatePaymentResponse> => {
  const response =
    await fetch(
      `${API_URL}/payments`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            orderId,
            method,
          }),
      },
    );

  const result:
    unknown =
    await response.json();

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message ===
        "string"
        ? result.message
        : "Failed to create payment";

    throw new Error(
      message,
    );
  }

  return result as CreatePaymentResponse;
};

export const getPaymentByOrderId =
  async (
    token: string,
    orderId: number,
  ): Promise<GetPaymentResponse> => {
    const response =
      await fetch(
        `${API_URL}/payments/order/${orderId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

    const result:
      unknown =
      await response.json();

    if (!response.ok) {
      const message =
        typeof result === "object" &&
        result !== null &&
        "message" in result &&
        typeof result.message ===
          "string"
        ? result.message
        : "Failed to fetch payment";

      throw new Error(
        message,
      );
    }

    return result as GetPaymentResponse;
  };

export const simulatePayment =
  async (
    token: string,
    paymentId: number,
    status:
      | "SUCCESS"
      | "FAILED",
    transactionId?:
      string | null,
  ): Promise<SimulatePaymentResponse> => {
    const response =
      await fetch(
        `${API_URL}/payments/${paymentId}/simulate`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body:
            JSON.stringify({
              status,

              transactionId:
                transactionId ??
                null,
            }),
        },
      );

    const result:
      unknown =
      await response.json();

    if (!response.ok) {
      const message =
        typeof result === "object" &&
        result !== null &&
        "message" in result &&
        typeof result.message ===
          "string"
        ? result.message
        : "Failed to simulate payment";

      throw new Error(
        message,
      );
    }

    return result as SimulatePaymentResponse;
  };