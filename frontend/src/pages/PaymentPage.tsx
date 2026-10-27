import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  CheckCircle,
  CreditCard,
  Loader2,
  Smartphone,
  Wallet,
  XCircle,
} from "lucide-react";

import Container from "../components/Container";
import Button from "../components/Button";

import {
  getOrderById,
  type Order,
} from "../api/orders.api";

import {
  simulatePayment,
} from "../api/payments.api";

import { useAuth } from "../context/AuthContext";

const PaymentPage = () => {
  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const navigate =
    useNavigate();

  const {
    token,
  } = useAuth();

  const [
    order,
    setOrder,
  ] = useState<Order | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const orderId =
    Number(id);

  useEffect(() => {
    const loadOrder =
      async () => {
        if (
          !token ||
          !Number.isInteger(
            orderId,
          ) ||
          orderId <= 0
        ) {
          setLoading(false);

          setError(
            "Invalid order.",
          );

          return;
        }

        try {
          setLoading(true);

          setError(null);

          const response =
            await getOrderById(
              token,
              orderId,
            );

          setOrder(
            response.data,
          );
        } catch (
          err
        ) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load payment.",
          );
        } finally {
          setLoading(false);
        }
      };

    loadOrder();
  }, [
    token,
    orderId,
  ]);

  const handlePayment =
    async (
      status:
        | "SUCCESS"
        | "FAILED",
    ) => {
      if (
        !token ||
        !order ||
        !order.payment
      ) {
        return;
      }

      try {
        setProcessing(true);

        setError(null);

        const transactionId =
          status === "SUCCESS"
            ? `TEST-${Date.now()}`
            : null;

        const response =
          await simulatePayment(
            token,
            order.payment.id,
            status,
            transactionId,
          );

        setOrder(
          (
            currentOrder,
          ) => {
            if (
              !currentOrder ||
              !currentOrder.payment
            ) {
              return currentOrder;
            }

            return {
              ...currentOrder,

              status:
                status ===
                "SUCCESS"
                  ? "PAID"
                  : status ===
                      "FAILED"
                    ? "PENDING"
                    : currentOrder.status,

              payment: {
                ...currentOrder.payment,

                id:
                  response.data.id,

                amount:
                  response.data.amount,

                method:
                  response.data.method,

                status:
                  response.data.status,

                orderId:
                  response.data.orderId,

                transactionId:
                  response.data
                    .transactionId,

                createdAt:
                  response.data
                    .createdAt,

                updatedAt:
                  response.data
                    .updatedAt,

                deletedAt:
                  response.data
                    .deletedAt,
              },
            };
          },
        );
      } catch (
        err
      ) {
        setError(
          err instanceof Error
            ? err.message
            : "Payment processing failed.",
        );
      } finally {
        setProcessing(false);
      }
    };

  const getPaymentIcon =
    () => {
      if (
        !order?.payment
      ) {
        return (
          <Wallet
            className="h-7 w-7"
          />
        );
      }

      if (
        order.payment.method ===
        "CARD"
      ) {
        return (
          <CreditCard
            className="h-7 w-7"
          />
        );
      }

      if (
        order.payment.method ===
        "MOBILE_MONEY"
      ) {
        return (
          <Smartphone
            className="h-7 w-7"
          />
        );
      }

      return (
        <Wallet
          className="h-7 w-7"
        />
      );
    };

  const getStatusContent =
    () => {
      if (
        !order?.payment
      ) {
        return null;
      }

      switch (
        order.payment.status
      ) {
        case "SUCCESS":
          return (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
              <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-600" />

              <h2 className="text-2xl font-bold text-green-800">
                Payment Successful
              </h2>

              <p className="mt-2 text-green-700">
                Your payment has been
                successfully
                processed.
              </p>

              {order.payment
                .transactionId && (
                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-sm text-gray-500">
                    Transaction ID
                  </p>

                  <p className="mt-1 font-mono font-semibold text-gray-900">
                    {
                      order.payment
                        .transactionId
                    }
                  </p>
                </div>
              )}
            </div>
          );

        case "FAILED":
          return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <XCircle className="mx-auto mb-4 h-14 w-14 text-red-600" />

              <h2 className="text-2xl font-bold text-red-800">
                Payment Failed
              </h2>

              <p className="mt-2 text-red-700">
                The payment could not
                be completed. You can
                try again.
              </p>
            </div>
          );

        case "REFUNDED":
          return (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center">
              <Wallet className="mx-auto mb-4 h-14 w-14 text-yellow-600" />

              <h2 className="text-2xl font-bold text-yellow-800">
                Payment Refunded
              </h2>

              <p className="mt-2 text-yellow-700">
                This payment has been
                refunded.
              </p>
            </div>
          );

        case "PENDING":
          return (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <Loader2 className="mx-auto mb-4 h-14 w-14 text-gray-600" />

              <h2 className="text-2xl font-bold text-gray-800">
                Payment Pending
              </h2>

              <p className="mt-2 text-gray-600">
                Your payment has not
                been completed yet.
              </p>
            </div>
          );

        default:
          return null;
      }
    };

  if (loading) {
    return (
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-gray-600" />

            <p className="mt-4 text-gray-600">
              Loading payment...
            </p>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container>
        <div className="mx-auto max-w-xl py-16 text-center">
          <XCircle className="mx-auto h-14 w-14 text-red-500" />

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Unable to load payment
          </h1>

          <p className="mt-2 text-gray-600">
            {error ||
              "Order not found."}
          </p>

          <Button
            className="mt-6"
            onClick={() =>
              navigate(
                "/orders",
              )
            }
          >
            Back to my orders
          </Button>
        </div>
      </Container>
    );
  }

  if (!order.payment) {
    return (
      <Container>
        <div className="mx-auto max-w-xl py-16 text-center">
          <Wallet className="mx-auto h-14 w-14 text-gray-500" />

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Payment unavailable
          </h1>

          <p className="mt-2 text-gray-600">
            This order does not have a
            payment record.
          </p>

          <Button
            className="mt-6"
            onClick={() =>
              navigate(
                `/orders/${order.id}`,
              )
            }
          >
            View Order
          </Button>
        </div>
      </Container>
    );
  }

  const paymentIsPending =
    order.payment.status ===
    "PENDING";

  const paymentIsComplete =
    order.payment.status ===
      "SUCCESS" ||
    order.payment.status ===
      "FAILED" ||
    order.payment.status ===
      "REFUNDED";

  return (
    <Container>
      <div className="mx-auto max-w-4xl py-10">
        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/orders/${order.id}`,
              )
            }
            className="mb-4 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            ← Back to order
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Payment
          </h1>

          <p className="mt-2 text-gray-600">
            Order{" "}
            <span className="font-semibold text-gray-900">
              {order.orderNumber}
            </span>
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {getStatusContent()}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  {getPaymentIcon()}
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Payment Method
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900">
                    {order.payment.method ===
                    "MOBILE_MONEY"
                      ? "Mobile Money"
                      : order.payment.method ===
                          "CARD"
                        ? "Card"
                        : "Cash on Delivery"}
                  </h2>
                </div>
              </div>

              {paymentIsPending && (
                <div className="mt-6">
                  {order.payment.method ===
                    "CASH" && (
                    <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <p className="font-semibold text-blue-900">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-sm text-blue-700">
                        Confirm the cash payment
                        below when the payment is
                        received.
                      </p>
                    </div>
                  )}

                  {order.payment.method ===
                    "CARD" && (
                    <div className="mb-5 rounded-xl border border-purple-200 bg-purple-50 p-4">
                      <p className="font-semibold text-purple-900">
                        Card Payment
                      </p>

                      <p className="mt-1 text-sm text-purple-700">
                        Card processing is
                        currently simulated for
                        development.
                      </p>
                    </div>
                  )}

                  {order.payment.method ===
                    "MOBILE_MONEY" && (
                    <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <p className="font-semibold text-orange-900">
                        Mobile Money
                      </p>

                      <p className="mt-1 text-sm text-orange-700">
                        Mobile money processing is
                        currently simulated for
                        development.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      className="w-full"
                      onClick={() =>
                        handlePayment(
                          "SUCCESS",
                        )
                      }
                      disabled={
                        processing
                      }
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                          Processing...
                        </>
                      ) : (
                        "Simulate Success"
                      )}
                    </Button>

                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() =>
                        handlePayment(
                          "FAILED",
                        )
                      }
                      disabled={
                        processing
                      }
                    >
                      Simulate Failure
                    </Button>
                  </div>

                  <p className="mt-4 text-center text-xs text-gray-500">
                    Development mode: card and
                    mobile money payments are
                    simulated. No real payment is
                    processed.
                  </p>
                </div>
              )}

              {paymentIsComplete && (
                <div className="mt-6">
                  <Button
                    className="w-full"
                    onClick={() =>
                      navigate(
                        `/orders/${order.id}`,
                      )
                    }
                  >
                    View Order Details
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Summary
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">
                  Order
                </span>

                <span className="font-medium text-gray-900">
                  {order.orderNumber}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">
                  Method
                </span>

                <span className="font-medium text-gray-900">
                  {order.payment.method ===
                  "MOBILE_MONEY"
                    ? "Mobile Money"
                    : order.payment.method ===
                        "CARD"
                      ? "Card"
                      : "Cash"}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-gray-900">
                    TSh{" "}
                    {Number(
                      order.payment.amount,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {paymentIsPending && (
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">
                  Payment Status
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Waiting for payment
                  confirmation.
                </p>
              </div>
            )}

            {paymentIsComplete && (
              <Button
                className="mt-6 w-full"
                onClick={() =>
                  navigate(
                    `/orders/${order.id}`,
                  )
                }
              >
                View Order
              </Button>
            )}
          </aside>
        </div>
      </div>
    </Container>
  );
};

export default PaymentPage;