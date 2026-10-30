import { useCallback, useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, CreditCard, MapPin, Package, Star, X } from "lucide-react";

import Button from "../components/Button";
import Container from "../components/Container";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import StatusTag from "../components/StatusTag";

import { getOrderById, type Order, type OrderItem } from "../api/orders.api";

import {
  createReview,
  getMyReviews,
  type CustomerReview,
} from "../api/reviews.api";

import { useAuth } from "../context/AuthContext";

import { formatTZS, getProductImageUrl, paymentMethodLabel, pickImage } from "../utils/format";

const MAX_COMMENT_LENGTH = 2000;

interface StarsProps {
  rating: number;
  size?: number;
}

function Stars({ rating, size = 15 }: StarsProps) {
  return (
    <div
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className="mt-1 flex items-center gap-0.5"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          aria-hidden="true"
          className={index < rating ? "fill-black text-black" : "text-neutral-300"}
        />
      ))}
    </div>
  );
}

function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [reviewProductName, setReviewProductName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Load order
  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      navigate("/login");
      return;
    }

    const orderId = Number(id);

    if (!id || !Number.isInteger(orderId) || orderId <= 0) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        // getOrderById returns { success: true, data: order }
        const response = await getOrderById(token, orderId);

        if (!cancelled) setOrder(response.data);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load order:", err);

        setError(err instanceof Error ? err.message : "Unable to load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [id, token, authLoading, navigate]);

  // Load the customer's reviews
  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setReviews([]);
      setReviewsLoading(false);
      return;
    }

    let cancelled = false;

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);

        const data = await getMyReviews(token);

        if (!cancelled) setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews:", err);

        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    };

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, [token, authLoading]);

  const getProductReview = (productId: number) =>
    reviews.find((review) => review.productId === productId);

  const openReviewModal = (productId: number, productName: string) => {
    setReviewProductId(productId);
    setReviewProductName(productName);
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
    setReviewSuccess("");
  };

  const closeReviewModal = useCallback(() => {
    if (submittingReview) return;

    setReviewProductId(null);
    setReviewProductName("");
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
    setReviewSuccess("");
  }, [submittingReview]);

  // Escape closes the review dialog
  useEffect(() => {
    if (reviewProductId === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeReviewModal();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reviewProductId, closeReviewModal]);

  const handleSubmitReview = async () => {
    if (!token) {
      setReviewError("You must be signed in to submit a review.");
      return;
    }

    if (!order) {
      setReviewError("Order information is unavailable.");
      return;
    }

    if (reviewProductId === null) {
      setReviewError("Select a product to review.");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Rating must be between 1 and 5.");
      return;
    }

    if (reviewComment.length > MAX_COMMENT_LENGTH) {
      setReviewError(`Your review can't be longer than ${MAX_COMMENT_LENGTH} characters.`);
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");
      setReviewSuccess("");

      const review = await createReview(token, {
        orderId: Number(id),
        productId: reviewProductId,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });

      setReviews((currentReviews) => [review, ...currentReviews]);

      setReviewSuccess(
        "Review submitted. It will appear once an admin approves it.",
      );
    } catch (err) {
      console.error("Failed to submit review:", err);

      setReviewError(
        err instanceof Error ? err.message : "Unable to submit review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (authLoading || loading) {
    return <Spinner label="Loading orderâ€¦" />;
  }

  if (error) {
    return (
      <EmptyState
        title={
          <>
            Unable to load <em>order</em>
          </>
        }
        message={error}
      >
        <Button onClick={() => navigate("/orders")}>Back to orders</Button>
      </EmptyState>
    );
  }

  if (!order) {
    return (
      <EmptyState
        title={
          <>
            Order not <em>found</em>
          </>
        }
      >
        <Link to="/orders" className="vero-btn vero-btn--ghost">
          Back to orders
        </Link>
      </EmptyState>
    );
  }

  const orderItems = order.items ?? [];

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "Date unavailable";

  const subtotal = orderItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  const isDelivered = order.status === "DELIVERED";

  const canPay =
    order.payment?.status === "PENDING" && order.status !== "CANCELLED";

  const renderReview = (productId: number, productName: string) => {
    if (reviewsLoading) {
      return <p className="text-sm text-neutral-500">Checking review statusâ€¦</p>;
    }

    if (!isDelivered) {
      return (
        <p className="text-sm text-neutral-500">
          You can review this product once the order is delivered.
        </p>
      );
    }

    const existingReview = getProductReview(productId);

    if (existingReview) {
      return (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm">Your review</p>

              <Stars rating={existingReview.rating} />
            </div>

            <StatusTag status={existingReview.status} />
          </div>

          {existingReview.comment && (
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              â€œ{existingReview.comment}â€
            </p>
          )}
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => openReviewModal(productId, productName)}
        className="vero-btn vero-btn--ghost gap-2"
      >
        <Star size={16} aria-hidden="true" />
        Write a review
      </button>
    );
  };

  return (
    <>
      <section className="py-12 sm:py-16">
        <Container>
          <Link
            to="/orders"
            className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to orders
          </Link>

          {/* Header */}
          <div className="mb-12 flex flex-col gap-6 border-b pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-sm text-neutral-500">
                Placed on {orderDate}
              </p>

              <h1 className="vero-title">
                Order <em>{order.orderNumber}</em>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <StatusTag status={order.status} />

              {canPay && (
                <Link to={`/payment/${order.id}`} className="vero-btn gap-2">
                  <CreditCard size={17} aria-hidden="true" />
                  Pay now
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              {/* Items */}
              <section className="border bg-white">
                <div className="border-b px-6 py-4">
                  <h2>Order items</h2>
                </div>

                {orderItems.length === 0 ? (
                  <p className="p-8 text-center text-sm text-neutral-500">
                    No items found for this order.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {orderItems.map((item: OrderItem) => {
                      const product = item.product;

                      // The backend includes product; the type marks it optional.
                      if (!product) {
                        return (
                          <li key={item.id} className="p-6">
                            <p className="text-sm text-neutral-500">
                              Product information is unavailable.
                            </p>
                          </li>
                        );
                      }

                      const image = pickImage(product.images);

                      return (
                        <li key={item.id} className="p-6">
                          <div className="flex gap-4">
                            <div className="aspect-square w-20 shrink-0 overflow-hidden bg-neutral-100 sm:w-24">
                              {image ? (
                                <img
                                  src={getProductImageUrl(image.imageUrl)}
                                  alt={image.altText || product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-neutral-400">
                                  <Package size={28} aria-hidden="true" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/products/${product.id}`}
                                className="line-clamp-2 text-lg hover:underline"
                              >
                                {product.name}
                              </Link>

                              <p className="mt-1 text-xs text-neutral-500">
                                SKU: {product.sku}
                              </p>

                              {item.variant && (
                                <p className="mt-2 text-sm text-neutral-600">
                                  {item.variant.name}: {item.variant.value}
                                </p>
                              )}

                              <p className="mt-3 text-sm">
                                <span className="text-neutral-500">
                                  Qty: {item.quantity}
                                </span>

                                <span className="ml-5">{formatTZS(item.price)}</span>
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 border-t pt-5">
                            {renderReview(product.id, product.name)}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Delivery address */}
              <section className="border bg-white">
                <div className="flex items-center gap-2 border-b px-6 py-4">
                  <MapPin size={19} aria-hidden="true" className="text-neutral-600" />

                  <h2>Delivery address</h2>
                </div>

                <div className="space-y-1 p-6 text-sm text-neutral-600">
                  {order.shippingLabel && (
                    <p className="mb-2 text-base text-black">
                      {order.shippingLabel}
                    </p>
                  )}

                  {order.shippingStreet && <p>{order.shippingStreet}</p>}

                  {order.shippingCity && (
                    <p>
                      {order.shippingCity}
                      {order.shippingRegion ? `, ${order.shippingRegion}` : ""}
                    </p>
                  )}

                  {order.shippingPostalCode && <p>{order.shippingPostalCode}</p>}

                  {order.shippingCountry && <p>{order.shippingCountry}</p>}
                </div>
              </section>

              {/* Payment */}
              {order.payment && (
                <section className="border bg-white">
                  <div className="flex items-center gap-2 border-b px-6 py-4">
                    <CreditCard
                      size={19}
                      aria-hidden="true"
                      className="text-neutral-600"
                    />

                    <h2>Payment</h2>
                  </div>

                  <div className="p-6">
                    <dl className="grid gap-6 sm:grid-cols-3">
                      <div>
                        <dt className="vero-label">Method</dt>

                        <dd className="mt-1">
                          {paymentMethodLabel(order.payment.method)}
                        </dd>
                      </div>

                      <div>
                        <dt className="vero-label">Amount</dt>

                        <dd className="mt-1">
                          {formatTZS(order.payment.amount ?? 0)}
                        </dd>
                      </div>

                      <div>
                        <dt className="vero-label">Status</dt>

                        <dd className="mt-1">
                          <StatusTag status={order.payment.status ?? "PENDING"} />
                        </dd>
                      </div>
                    </dl>

                    {order.payment.transactionId && (
                      <div className="mt-6 border-t pt-4">
                        <p className="vero-label">Transaction ID</p>

                        <p className="mt-1 break-all text-sm">
                          {order.payment.transactionId}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Summary */}
            <aside>
              <div className="sticky top-6 border bg-white">
                <div className="border-b px-6 py-4">
                  <h2>Order summary</h2>
                </div>

                <dl className="space-y-4 p-6 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Items</dt>
                    <dd>{orderItems.length}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Subtotal</dt>
                    <dd>{formatTZS(subtotal)}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Shipping</dt>
                    <dd>Free</dd>
                  </div>

                  <div className="flex justify-between gap-4 border-t pt-4 text-base">
                    <dt>Total</dt>
                    <dd className="text-xl">{formatTZS(order.total)}</dd>
                  </div>
                </dl>

                {canPay && (
                  <div className="px-6 pb-6">
                    <Link
                      to={`/payment/${order.id}`}
                      className="vero-btn w-full gap-2"
                    >
                      <CreditCard size={17} aria-hidden="true" />
                      Complete payment
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Review dialog */}
      {reviewProductId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            className="max-h-full w-full max-w-lg overflow-y-auto border bg-white"
          >
            <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
              <div className="min-w-0">
                <h2 id="review-title">Write a review</h2>

                <p className="mt-1 line-clamp-1 text-sm text-neutral-500">
                  {reviewProductName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={submittingReview}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center hover:bg-[color:var(--paper-deep)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close review dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <p className="vero-label mb-3">Your rating</p>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, index) => {
                    const rating = index + 1;

                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        disabled={submittingReview}
                        aria-label={`Rate ${rating} out of 5`}
                        aria-pressed={rating === reviewRating}
                        className="p-1 disabled:cursor-not-allowed"
                      >
                        <Star
                          size={30}
                          aria-hidden="true"
                          className={
                            rating <= reviewRating
                              ? "fill-black text-black"
                              : "text-neutral-300"
                          }
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-neutral-500">
                  {reviewRating} out of 5 stars
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="review-comment" className="vero-label">
                    Your review
                  </label>

                  <span className="text-xs text-neutral-400">
                    {reviewComment.length}/{MAX_COMMENT_LENGTH}
                  </span>
                </div>

                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  maxLength={MAX_COMMENT_LENGTH}
                  rows={5}
                  placeholder="Tell other customers about your experience with this product."
                  disabled={submittingReview}
                  className="vero-input resize-none"
                />
              </div>

              {reviewError && (
                <div className="vero-error mt-6" role="alert">
                  {reviewError}
                </div>
              )}

              {reviewSuccess && (
                <p
                  className="mt-6 border-l-2 border-black py-2 pl-4 text-sm"
                  role="status"
                >
                  {reviewSuccess}
                </p>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={submittingReview}
                  className="vero-btn vero-btn--ghost"
                >
                  {reviewSuccess ? "Close" : "Cancel"}
                </button>

                {!reviewSuccess && (
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="vero-btn gap-2"
                    aria-busy={submittingReview}
                  >
                    <Star size={16} aria-hidden="true" />
                    {submittingReview ? "Submittingâ€¦" : "Submit review"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OrderDetailsPage;


