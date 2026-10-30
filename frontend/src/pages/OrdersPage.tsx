import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { ArrowRight, Package } from "lucide-react";

import Button from "../components/Button";
import Container from "../components/Container";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import StatusTag from "../components/StatusTag";

import { getMyOrders, type Order } from "../api/orders.api";

import { useAuth } from "../context/AuthContext";

import { formatTZS, getProductImageUrl, pickImage } from "../utils/format";

function OrdersPage() {
  const navigate = useNavigate();

  const { token, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyOrders(token);

        if (!cancelled) setOrders(response.data);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load orders:", err);

        setError(
          err instanceof Error ? err.message : "Failed to load orders.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [token, authLoading, navigate]);

  if (authLoading || loading) {
    return <Spinner label="Loading your ordersâ€¦" />;
  }

  if (error) {
    return (
      <EmptyState
        title={
          <>
            Something went <em>wrong</em>
          </>
        }
        message={error}
      >
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </EmptyState>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title={
          <>
            No orders <em>yet</em>
          </>
        }
        message="When you place an order, it will show up here."
      >
        <Link to="/products" className="vero-btn">
          Start shopping
        </Link>
      </EmptyState>
    );
  }

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 border-b pb-8">
            <h1>
              My <em>orders</em>
            </h1>

            <p className="mt-4 text-neutral-600">
              View and track your orders.
            </p>
          </div>

          <ul className="divide-y border-b border-t">
            {orders.map((order) => {
              const itemCount =
                order.items?.reduce((count, item) => count + item.quantity, 0) ??
                0;

              const firstItem = order.items?.[0];
              const firstProduct = firstItem?.product;
              const image = pickImage(firstProduct?.images);

              return (
                <li key={order.id}>
                  <Link
                    to={`/orders/${order.id}`}
                    className="group -mx-4 flex flex-col gap-5 px-4 py-6 hover:bg-[color:var(--card)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 gap-4">
                      <div className="flex aspect-square w-16 shrink-0 items-center justify-center overflow-hidden bg-neutral-100">
                        {image ? (
                          <img
                            src={getProductImageUrl(image.imageUrl)}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <Package
                            size={22}
                            className="text-neutral-400"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-lg">#{order.orderNumber}</p>

                        <p className="mt-1 text-sm text-neutral-500">
                          {order.createdAt &&
                            `${new Date(order.createdAt).toLocaleDateString()} Â· `}
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </p>

                        {firstProduct?.name && (
                          <p className="mt-1 truncate text-sm text-neutral-600">
                            {firstProduct.name}
                            {itemCount > 1 && " + more"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <p className="text-lg">{formatTZS(order.total)}</p>

                        <StatusTag status={order.status} />
                      </div>

                      <ArrowRight
                        size={20}
                        aria-hidden="true"
                        className="text-neutral-400 transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

export default OrdersPage;


