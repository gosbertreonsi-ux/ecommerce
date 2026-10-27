import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Smartphone,
  Wallet,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Button from "../components/Button";
import Container from "../components/Container";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";

import { getOrderById, type Order } from "../api/orders.api";

import { simulatePayment } from "../api/payments.api";

import { useAuth } from "../context/AuthContext";

import { formatTZS, paymentMethodLabel } from "../utils/format";

type PaymentStatus = "SUCCESS" | "FAILED" | "REFUNDED" | "PENDING";

const STATUS_CONTENT: Record<
  PaymentStatus,
  { title: string; message: string; icon: LucideIcon; danger?: boolean }
> = {
  SUCCESS: {
    title: "Payment successful",
    message: "Your payment has been processed.",
    icon: CheckCircle,
  },
  FAILED: {
    title: "Payment failed",
    message: "The payment could not be completed. You can try again.",
    icon: XCircle,
    danger: true,
  },
  REFUNDED: {
    title: "Payment refunded",
    message: "This payment has been refunded.",
    icon: Wallet,
  },
  PENDING: {
    title: "Payment pending",
    message: "Your payment has not been completed yet.",
    icon: Clock,
  },
};

const METHOD_ICON: Record<string, LucideIcon> = {
  CARD: CreditCard,
  MOBILE_MONEY: Smartphone,
  CASH: Wallet,
};

const METHOD_NOTE: Record<string, string> = {
  CASH: "Confirm the cash payment below once the money has been received.",
  CARD: "Card processing is simulated for development.",
  MOBILE_MONEY: "Mobile money processing is simulated for development.",
};

function PaymentPage() {
  const { id } = useParams<{ id: string }>();

  const { token } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = Number(id);

  useEffect(() => {
    if (!token || !Number.isInteger(orderId) || orderId <= 0) {
      setLoading(false);
      setError("Invalid order.");
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getOrderById(token, orderId);

        if (!cancelled) setOrder(response.data);
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof Error ? err.message : "Failed to load payment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [token, orderId]);

  const handlePayment = async (status: "SUCCESS" | "FAILED") => {
    if (!token || !order || !order.payment) return;

    try {
      setProcessing(true);
      setError(null);

      const transactionId = status === "SUCCESS" ? `TEST-${Date.now()}` : null;

      const response = await simulatePayment(
        token,
        order.payment.id,
        status,
        transactionId,
      );

      setOrder((currentOrder) => {
        if (!currentOrder || !currentOrder.payment) return currentOrder;

        return {
          ...currentOrder,

          status: status === "SUCCESS" ? "PAID" : "PENDING",

          payment: {
            ...currentOrder.payment,
            id: response.data.id,
            amount: response.data.amount,
            method: response.data.method,
            status: response.data.status,
            orderId: response.data.orderId,
            transactionId: response.data.transactionId,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt,
            deletedAt: response.data.deletedAt,
          },
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading payment…" />;
  }

  if (error || !order) {
    return (
      <EmptyState
        title={
          <>
            Unable to load <em>payment</em>
          </>
        }
        message={error || "Order not found."}
      >
        <Link to="/orders" className="vero-btn">
          Back to my orders
        </Link>
      </EmptyState>
    );
  }

  if (!order.payment) {
    return (
      <EmptyState
        title={
          <>
            Payment <em>unavailable</em>
          </>
        }
        message="This order does not have a payment record."
      >
        <Link to={`/orders/${order.id}`} className="vero-btn">
          View order
        </Link>
      </EmptyState>
    );
  }

  const { payment } = order;

  const orderPath = `/orders/${order.id}`;
  const methodName = paymentMethodLabel(payment.method);
  const MethodIcon = METHOD_ICON[payment.method] ?? Wallet;
  const status = STATUS_CONTENT[payment.status as PaymentStatus];
  const StatusIcon = status?.icon;

  const isPending = payment.status === "PENDING";
  const isSettled =
    payment.status === "SUCCESS" ||
    payment.status === "FAILED" ||
    payment.status === "REFUNDED";

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-4xl">
          <Link
            to={orderPath}
            className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to order
          </Link>

          <div className="mb-12 border-b pb-8">
            <h1>
              Order <em>payment</em>
            </h1>

            <p className="mt-4 text-neutral-600">Order {order.orderNumber}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {status && StatusIcon && (
                <div
                  role="status"
                  className="flex items-start gap-4 border bg-white p-6 sm:p-8"
                >
                  <StatusIcon
                    size={28}
                    aria-hidden="true"
                    className={`shrink-0 ${
                      status.danger ? "text-[color:var(--danger)]" : ""
                    }`}
                  />

                  <div>
                    <h2>{status.title}</h2>

                    <p className="mt-2 text-neutral-600">{status.message}</p>

                    {payment.status === "SUCCESS" && payment.transactionId && (
                      <p className="mt-4 text-sm text-neutral-500">
                        Transaction ID
                        <span className="mt-1 block break-all font-mono text-black">
                          {payment.transactionId}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="border bg-white p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <MethodIcon size={28} aria-hidden="true" />

                  <div>
                    <p className="text-sm text-neutral-500">Payment method</p>

                    <h2>{methodName}</h2>
                  </div>
                </div>

                {isPending && (
                  <div className="mt-8">
                    {METHOD_NOTE[payment.method] && (
                      <p className="mb-6 border-l-2 border-black py-1 pl-4 text-sm text-neutral-600">
                        {METHOD_NOTE[payment.method]}
                      </p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button
                        className="w-full"
                        onClick={() => handlePayment("SUCCESS")}
                        disabled={processing}
                      >
                        {processing ? "Processing…" : "Simulate success"}
                      </Button>

                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => handlePayment("FAILED")}
                        disabled={processing}
                      >
                        Simulate failure
                      </Button>
                    </div>

                    <p className="mt-4 text-center text-xs text-neutral-500">
                      Development mode: no real payment is processed.
                    </p>
                  </div>
                )}

                {isSettled && (
                  <Link to={orderPath} className="vero-btn mt-8 w-full">
                    View order details
                  </Link>
                )}
              </div>

              {error && (
                <div className="vero-error" role="alert">
                  {error}
                </div>
              )}
            </div>

            <aside className="h-fit border bg-white p-6 sm:p-8">
              <h2>Payment summary</h2>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-600">Order</dt>
                  <dd>{order.orderNumber}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-600">Method</dt>
                  <dd>{methodName}</dd>
                </div>

                <div className="flex justify-between gap-4 border-t pt-4 text-base">
                  <dt>Total</dt>
                  <dd className="text-xl">{formatTZS(payment.amount)}</dd>
                </div>
              </dl>

              {isPending && (
                <p className="mt-6 text-sm text-neutral-600">
                  Waiting for payment confirmation.
                </p>
              )}

              {isSettled && (
                <Link to={orderPath} className="vero-btn vero-btn--ghost mt-6 w-full">
                  View order
                </Link>
              )}
            </aside>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default PaymentPage;