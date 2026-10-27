import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  Smartphone,
  Star,
  X,
} from "lucide-react";

import Container from "../components/Container";
import Button from "../components/Button";

import {
  getOrderById,
  type Order,
  type OrderItem,
} from "../api/orders.api";

import {
  createReview,
  getMyReviews,
  type CustomerReview,
} from "../api/reviews.api";

import { useAuth } from "../context/AuthContext";


function OrderDetailsPage() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    token,
    loading: authLoading,
  } = useAuth();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reviews, setReviews] =
    useState<CustomerReview[]>([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [
    reviewProductId,
    setReviewProductId,
  ] = useState<number | null>(null);

  const [
    reviewProductName,
    setReviewProductName,
  ] = useState("");

  const [
    reviewRating,
    setReviewRating,
  ] = useState(5);

  const [
    reviewComment,
    setReviewComment,
  ] = useState("");

  const [
    submittingReview,
    setSubmittingReview,
  ] = useState(false);

  const [
    reviewError,
    setReviewError,
  ] = useState("");

  const [
    reviewSuccess,
    setReviewSuccess,
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | LOAD ORDER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    if (!id) {
      setError(
        "Invalid order ID.",
      );

      setLoading(false);

      return;
    }

    const orderId =
      Number(id);

    if (
      !Number.isInteger(
        orderId,
      ) ||
      orderId <= 0
    ) {
      setError(
        "Invalid order ID.",
      );

      setLoading(false);

      return;
    }

    const loadOrder =
      async () => {
        try {
          setLoading(true);

          setError("");

          const response =
            await getOrderById(
              token,
              orderId,
            );

          /*
          |--------------------------------------------------------------------------
          | getOrderById returns:
          |
          | {
          |   success: true,
          |   data: order
          | }
          |
          | Therefore we store response.data.
          |--------------------------------------------------------------------------
          */

          setOrder(
            response.data,
          );
        } catch (err) {
          console.error(
            "Failed to load order:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load order.",
          );
        } finally {
          setLoading(false);
        }
      };

    loadOrder();
  }, [
    id,
    token,
    authLoading,
    navigate,
  ]);


  /*
  |--------------------------------------------------------------------------
  | LOAD CUSTOMER REVIEWS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!token) {
      setReviews([]);

      setReviewsLoading(
        false,
      );

      return;
    }

    const loadReviews =
      async () => {
        try {
          setReviewsLoading(
            true,
          );

          const data =
            await getMyReviews(
              token,
            );

          setReviews(data);
        } catch (err) {
          console.error(
            "Failed to load reviews:",
            err,
          );

          setReviews([]);
        } finally {
          setReviewsLoading(
            false,
          );
        }
      };

    loadReviews();
  }, [
    token,
    authLoading,
  ]);


  /*
  |--------------------------------------------------------------------------
  | GET EXISTING REVIEW
  |--------------------------------------------------------------------------
  */

  const getProductReview =
    (
      productId: number,
    ) => {
      return reviews.find(
        (review) =>
          review.productId ===
          productId,
      );
    };


  /*
  |--------------------------------------------------------------------------
  | OPEN REVIEW MODAL
  |--------------------------------------------------------------------------
  */

  const openReviewModal =
    (
      productId: number,
      productName: string,
    ) => {
      setReviewProductId(
        productId,
      );

      setReviewProductName(
        productName,
      );

      setReviewRating(5);

      setReviewComment("");

      setReviewError("");

      setReviewSuccess("");
    };


  /*
  |--------------------------------------------------------------------------
  | CLOSE REVIEW MODAL
  |--------------------------------------------------------------------------
  */

  const closeReviewModal =
    () => {
      if (submittingReview) {
        return;
      }

      setReviewProductId(
        null,
      );

      setReviewProductName(
        "",
      );

      setReviewRating(5);

      setReviewComment("");

      setReviewError("");

      setReviewSuccess("");
    };


  /*
  |--------------------------------------------------------------------------
  | SUBMIT REVIEW
  |--------------------------------------------------------------------------
  */

  const handleSubmitReview =
    async () => {
      if (!token) {
        setReviewError(
          "You must be logged in to submit a review.",
        );

        return;
      }

      if (!order) {
        setReviewError(
          "Order information is unavailable.",
        );

        return;
      }

      if (
        reviewProductId ===
        null
      ) {
        setReviewError(
          "Please select a product to review.",
        );

        return;
      }

      if (
        reviewRating < 1 ||
        reviewRating > 5
      ) {
        setReviewError(
          "Rating must be between 1 and 5.",
        );

        return;
      }

      if (
        reviewComment.length >
        2000
      ) {
        setReviewError(
          "Review comment cannot exceed 2000 characters.",
        );

        return;
      }

      try {
        setSubmittingReview(
          true,
        );

        setReviewError("");

        setReviewSuccess("");

        const review =
          await createReview(
            token,
            {
              orderId:
                Number(id),

              productId:
                reviewProductId,

              rating:
                reviewRating,

              comment:
                reviewComment.trim() ||
                null,
            },
          );

        setReviews(
          (
            currentReviews,
          ) => [
            review,
            ...currentReviews,
          ],
        );

        setReviewSuccess(
          "Review submitted successfully. It is now awaiting admin approval.",
        );
      } catch (err) {
        console.error(
          "Failed to submit review:",
          err,
        );

        setReviewError(
          err instanceof Error
            ? err.message
            : "Unable to submit review.",
        );
      } finally {
        setSubmittingReview(
          false,
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (
    authLoading ||
    loading
  ) {
    return (
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />

            <p className="text-sm text-neutral-500">
              Loading order...
            </p>

          </div>
        </div>
      </Container>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Package
                size={24}
              />
            </div>

            <h1 className="mb-2 text-xl font-semibold text-neutral-900">
              Unable to load order
            </h1>

            <p className="mb-6 text-sm text-red-600">
              {error}
            </p>

            <Button
              onClick={() =>
                navigate("/orders")
              }
            >
              Back to Orders
            </Button>

          </div>

        </div>
      </Container>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | ORDER NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!order) {
    return (
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <h1 className="mb-3 text-2xl font-semibold">
              Order not found
            </h1>

            <Link
              to="/orders"
              className="text-sm font-medium underline"
            >
              Back to Orders
            </Link>

          </div>

        </div>
      </Container>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | SAFE ORDER DATA
  |--------------------------------------------------------------------------
  */

  const orderItems =
    order.items ?? [];

  const orderDate =
    order.createdAt
      ? new Date(
          order.createdAt,
        ).toLocaleString()
      : "Date unavailable";


  const subtotal =
    orderItems.reduce(
      (
        total,
        item,
      ) =>
        total +
        Number(item.price) *
          item.quantity,
      0,
    );


  /*
  |--------------------------------------------------------------------------
  | FORMAT PRICE
  |--------------------------------------------------------------------------
  */

  const formatPrice =
    (
      value: number | string,
    ) => {
      return Number(
        value,
      ).toLocaleString(
        "en-TZ",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      );
    };


  /*
  |--------------------------------------------------------------------------
  | ORDER STATUS CLASSES
  |--------------------------------------------------------------------------
  */

  const getStatusClasses =
    (
      status: string,
    ) => {
      switch (status) {
        case "DELIVERED":
          return "bg-green-100 text-green-700";

        case "SHIPPED":
          return "bg-blue-100 text-blue-700";

        case "PROCESSING":
          return "bg-purple-100 text-purple-700";

        case "PAID":
          return "bg-emerald-100 text-emerald-700";

        case "CANCELLED":
          return "bg-red-100 text-red-700";

        case "PENDING":
        default:
          return "bg-yellow-100 text-yellow-700";
      }
    };


  /*
  |--------------------------------------------------------------------------
  | PAYMENT STATUS CLASSES
  |--------------------------------------------------------------------------
  */

  const getPaymentStatusClasses =
    (
      status?: string,
    ) => {
      switch (status) {
        case "SUCCESS":
          return "bg-green-100 text-green-700";

        case "FAILED":
          return "bg-red-100 text-red-700";

        case "REFUNDED":
          return "bg-purple-100 text-purple-700";

        case "PENDING":
        default:
          return "bg-yellow-100 text-yellow-700";
      }
    };


  return (
    <>
      <Container>

        <div className="py-8">

          {/* Back */}
          <Link
            to="/orders"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
          >
            <ArrowLeft
              size={18}
            />

            Back to Orders
          </Link>


          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="mb-2 flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
                  Order{" "}
                  {order.orderNumber}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>

              </div>

              <p className="text-sm text-neutral-500">
                Placed on{" "}
                {orderDate}
              </p>

            </div>


            {order.payment &&
              order.payment.status ===
                "PENDING" &&
              order.status !==
                "CANCELLED" && (
                <Link
                  to={`/payment/${order.id}`}
                >
                  <Button>

                    <CreditCard
                      size={17}
                    />

                    Pay Now

                  </Button>
                </Link>
              )}

          </div>


          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            {/* MAIN */}
            <div className="space-y-6">


              {/* ORDER ITEMS */}
              <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">

                <div className="border-b border-neutral-200 px-5 py-4">

                  <div className="flex items-center gap-2">

                    <Package
                      size={19}
                      className="text-neutral-600"
                    />

                    <h2 className="font-semibold text-neutral-900">
                      Order Items
                    </h2>

                  </div>

                </div>


                <div className="divide-y divide-neutral-200">

                  {orderItems.length ===
                  0 ? (
                    <div className="p-8 text-center text-sm text-neutral-500">
                      No items found for this order.
                    </div>
                  ) : (
                    orderItems.map(
                      (
                        item: OrderItem,
                      ) => {

                        /*
                        |--------------------------------------------------------------------------
                        | The backend includes product.
                        | The frontend type marks it optional because
                        | API responses can technically omit it.
                        |--------------------------------------------------------------------------
                        */

                        const product =
                          item.product;

                        if (!product) {
                          return (
                            <div
                              key={
                                item.id
                              }
                              className="p-5"
                            >
                              <p className="text-sm text-neutral-500">
                                Product information is unavailable.
                              </p>
                            </div>
                          );
                        }


                        const image =
                          product.images?.find(
                            (
                              productImage,
                            ) =>
                              productImage.isPrimary,
                          ) ||
                          product.images?.[0];


                        const existingReview =
                          getProductReview(
                            product.id,
                          );


                        return (
                          <div
                            key={
                              item.id
                            }
                            className="p-5"
                          >

                            <div className="flex gap-4">

                              {/* Product image */}
                              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">

                                {image ? (
                                  <img
                                    src={
                                      image.imageUrl
                                    }
                                    alt={
                                      image.altText ||
                                      product.name
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-neutral-400">
                                    <Package
                                      size={28}
                                    />
                                  </div>
                                )}

                              </div>


                              {/* Product details */}
                              <div className="min-w-0 flex-1">

                                <Link
                                  to={`/products/${product.id}`}
                                  className="line-clamp-2 font-semibold text-neutral-900 hover:underline"
                                >
                                  {
                                    product.name
                                  }
                                </Link>


                                <p className="mt-1 text-xs text-neutral-500">
                                  SKU:{" "}
                                  {
                                    product.sku
                                  }
                                </p>


                                {/* Variant */}
                                {item.variant && (
                                  <div className="mt-2 inline-flex items-center rounded-lg bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">

                                    <span className="font-medium">
                                      {
                                        item.variant.name
                                      }
                                      :
                                    </span>

                                    <span className="ml-1">
                                      {
                                        item.variant.value
                                      }
                                    </span>

                                  </div>
                                )}


                                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">

                                  <span className="text-neutral-500">

                                    Qty:

                                    <span className="font-medium text-neutral-900">
                                      {" "}
                                      {
                                        item.quantity
                                      }
                                    </span>

                                  </span>


                                  <span className="font-semibold text-neutral-900">
                                    TZS{" "}
                                    {formatPrice(
                                      Number(
                                        item.price,
                                      ),
                                    )}
                                  </span>

                                </div>

                              </div>

                            </div>


                            {/* REVIEW */}
                            <div
                              className={`mt-5 rounded-xl border p-4 transition ${
                                order.status ===
                                  "DELIVERED" &&
                                !existingReview
                                  ? "cursor-pointer border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100"
                                  : "border-neutral-200 bg-neutral-50"
                              }`}
                              onClick={() => {
                                if (
                                  order.status ===
                                    "DELIVERED" &&
                                  !existingReview &&
                                  !reviewsLoading
                                ) {
                                  openReviewModal(
                                    product.id,
                                    product.name,
                                  );
                                }
                              }}
                              role={
                                order.status ===
                                  "DELIVERED" &&
                                !existingReview
                                  ? "button"
                                  : undefined
                              }
                              tabIndex={
                                order.status ===
                                  "DELIVERED" &&
                                !existingReview
                                  ? 0
                                  : undefined
                              }
                              onKeyDown={(
                                event,
                              ) => {
                                if (
                                  order.status ===
                                    "DELIVERED" &&
                                  !existingReview &&
                                  !reviewsLoading &&
                                  (
                                    event.key ===
                                      "Enter" ||
                                    event.key ===
                                      " "
                                  )
                                ) {
                                  event.preventDefault();

                                  openReviewModal(
                                    product.id,
                                    product.name,
                                  );
                                }
                              }}
                            >

                              {reviewsLoading ? (

                                <div className="flex items-center gap-2 text-sm text-neutral-500">

                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />

                                  Checking review status...

                                </div>

                              ) : order.status !==
                                "DELIVERED" ? (

                                <div>

                                  <p className="text-sm font-medium text-neutral-800">
                                    Review available after delivery
                                  </p>

                                  <p className="mt-1 text-xs text-neutral-500">
                                    Once this order is delivered, you can rate this product and leave a review.
                                  </p>

                                </div>

                              ) : existingReview ? (

                                <div>

                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>

                                      <p className="text-sm font-semibold text-neutral-900">
                                        You reviewed this product
                                      </p>

                                      <div className="mt-1 flex items-center gap-1">

                                        {Array.from(
                                          {
                                            length: 5,
                                          },
                                          (
                                            _,
                                            index,
                                          ) => (
                                            <Star
                                              key={
                                                index
                                              }
                                              size={
                                                15
                                              }
                                              className={
                                                index <
                                                existingReview.rating
                                                  ? "fill-yellow-400 text-yellow-400"
                                                  : "text-neutral-300"
                                              }
                                            />
                                          ),
                                        )}

                                      </div>

                                    </div>


                                    <span
                                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                        existingReview.status ===
                                        "APPROVED"
                                          ? "bg-green-100 text-green-700"
                                          : existingReview.status ===
                                            "REJECTED"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-yellow-100 text-yellow-700"
                                      }`}
                                    >
                                      {
                                        existingReview.status
                                      }
                                    </span>

                                  </div>


                                  {existingReview.comment && (
                                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                                      "
                                      {
                                        existingReview.comment
                                      }
                                      "
                                    </p>
                                  )}

                                </div>

                              ) : (

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                  <div>

                                    <p className="text-sm font-semibold text-neutral-900">
                                      How was this product?
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-500">
                                      Click here to rate this product and share your experience.
                                    </p>

                                  </div>


                                  <button
                                    type="button"
                                    onClick={(
                                      event,
                                    ) => {
                                      event.stopPropagation();

                                      openReviewModal(
                                        product.id,
                                        product.name,
                                      );
                                    }}
                                    className="inline-flex w-fit items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                                  >

                                    <Star
                                      size={16}
                                    />

                                    Write a Review

                                  </button>

                                </div>

                              )}

                            </div>

                          </div>
                        );
                      },
                    )
                  )}

                </div>

              </section>


              {/* DELIVERY ADDRESS */}
              <section className="rounded-2xl border border-neutral-200 bg-white">

                <div className="border-b border-neutral-200 px-5 py-4">

                  <div className="flex items-center gap-2">

                    <MapPin
                      size={19}
                      className="text-neutral-600"
                    />

                    <h2 className="font-semibold text-neutral-900">
                      Delivery Address
                    </h2>

                  </div>

                </div>


                <div className="p-5">

                  {order.shippingLabel && (
                    <p className="mb-2 font-semibold text-neutral-900">
                      {
                        order.shippingLabel
                      }
                    </p>
                  )}


                  {order.shippingStreet && (
                    <p className="text-sm text-neutral-600">
                      {
                        order.shippingStreet
                      }
                    </p>
                  )}


                  {order.shippingCity && (
                    <p className="text-sm text-neutral-600">
                      {
                        order.shippingCity
                      }

                      {order.shippingRegion
                        ? `, ${order.shippingRegion}`
                        : ""}
                    </p>
                  )}


                  {order.shippingPostalCode && (
                    <p className="text-sm text-neutral-600">
                      {
                        order.shippingPostalCode
                      }
                    </p>
                  )}


                  {order.shippingCountry && (
                    <p className="text-sm text-neutral-600">
                      {
                        order.shippingCountry
                      }
                    </p>
                  )}

                </div>

              </section>


              {/* PAYMENT */}
              {order.payment && (
                <section className="rounded-2xl border border-neutral-200 bg-white">

                  <div className="border-b border-neutral-200 px-5 py-4">

                    <div className="flex items-center gap-2">

                      {order.payment.method ===
                      "MOBILE_MONEY" ? (
                        <Smartphone
                          size={19}
                          className="text-neutral-600"
                        />
                      ) : (
                        <CreditCard
                          size={19}
                          className="text-neutral-600"
                        />
                      )}

                      <h2 className="font-semibold text-neutral-900">
                        Payment
                      </h2>

                    </div>

                  </div>


                  <div className="p-5">

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <div>

                        <p className="text-xs uppercase tracking-wide text-neutral-400">
                          Method
                        </p>

                        <p className="mt-1 text-sm font-medium text-neutral-900">
                          {
                            order.payment.method ??
                            "Unavailable"
                          }
                        </p>

                      </div>


                      <div>

                        <p className="text-xs uppercase tracking-wide text-neutral-400">
                          Amount
                        </p>

                        <p className="mt-1 text-sm font-semibold text-neutral-900">
                          TZS{" "}
                          {formatPrice(
                            Number(
                              order.payment.amount ??
                                0,
                            ),
                          )}
                        </p>

                      </div>


                      <div>

                        <p className="text-xs uppercase tracking-wide text-neutral-400">
                          Status
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                            order.payment.status,
                          )}`}
                        >
                          {
                            order.payment.status ??
                            "PENDING"
                          }
                        </span>

                      </div>

                    </div>


                    {order.payment.transactionId && (
                      <div className="mt-5 border-t border-neutral-100 pt-4">

                        <p className="text-xs uppercase tracking-wide text-neutral-400">
                          Transaction ID
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-neutral-900">
                          {
                            order.payment.transactionId
                          }
                        </p>

                      </div>
                    )}

                  </div>

                </section>
              )}

            </div>


            {/* SIDEBAR */}
            <aside>

              <div className="sticky top-6 rounded-2xl border border-neutral-200 bg-white">

                <div className="border-b border-neutral-200 px-5 py-4">

                  <h2 className="font-semibold text-neutral-900">
                    Order Summary
                  </h2>

                </div>


                <div className="space-y-4 p-5">

                  <div className="flex items-center justify-between gap-4 text-sm">

                    <span className="text-neutral-500">
                      Items
                    </span>

                    <span className="font-medium text-neutral-900">
                      {
                        orderItems.length
                      }
                    </span>

                  </div>


                  <div className="flex items-center justify-between gap-4 text-sm">

                    <span className="text-neutral-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-neutral-900">
                      TZS{" "}
                      {formatPrice(
                        subtotal,
                      )}
                    </span>

                  </div>


                  <div className="flex items-center justify-between gap-4 text-sm">

                    <span className="text-neutral-500">
                      Shipping
                    </span>

                    <span className="font-medium text-green-600">
                      Free
                    </span>

                  </div>


                  <div className="border-t border-neutral-200 pt-4">

                    <div className="flex items-center justify-between gap-4">

                      <span className="font-semibold text-neutral-900">
                        Total
                      </span>

                      <span className="text-xl font-bold text-neutral-900">
                        TZS{" "}
                        {formatPrice(
                          Number(
                            order.total,
                          ),
                        )}
                      </span>

                    </div>

                  </div>


                  {order.payment &&
                    order.payment.status ===
                      "PENDING" &&
                    order.status !==
                      "CANCELLED" && (

                      <Link
                        to={`/payment/${order.id}`}
                        className="block pt-2"
                      >

                        <Button className="w-full">

                          <CreditCard
                            size={17}
                          />

                          Complete Payment

                        </Button>

                      </Link>
                    )}

                </div>

              </div>

            </aside>

          </div>

        </div>

      </Container>


      {/* REVIEW MODAL */}
      {reviewProductId !==
        null && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">

              <div>

                <h2 className="text-lg font-semibold text-neutral-900">
                  Write a Review
                </h2>

                <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
                  {
                    reviewProductName
                  }
                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeReviewModal
                }
                disabled={
                  submittingReview
                }
                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close review modal"
              >

                <X
                  size={20}
                />

              </button>

            </div>


            <div className="p-5">

              {/* Rating */}
              <div className="mb-6">

                <p className="mb-3 text-sm font-medium text-neutral-900">
                  Your Rating
                </p>


                <div className="flex items-center gap-2">

                  {Array.from(
                    {
                      length: 5,
                    },
                    (
                      _,
                      index,
                    ) => {

                      const rating =
                        index + 1;

                      return (
                        <button
                          key={
                            rating
                          }
                          type="button"
                          onClick={() =>
                            setReviewRating(
                              rating,
                            )
                          }
                          disabled={
                            submittingReview
                          }
                          className="rounded-md p-1 transition hover:bg-yellow-50 disabled:cursor-not-allowed"
                          aria-label={`Rate ${rating} out of 5`}
                        >

                          <Star
                            size={30}
                            className={
                              rating <=
                              reviewRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-neutral-300"
                            }
                          />

                        </button>
                      );
                    },
                  )}

                </div>


                <p className="mt-2 text-xs text-neutral-500">
                  {reviewRating}{" "}
                  out of 5 stars
                </p>

              </div>


              {/* Comment */}
              <div>

                <div className="mb-2 flex items-center justify-between gap-3">

                  <label
                    htmlFor="review-comment"
                    className="text-sm font-medium text-neutral-900"
                  >
                    Your Review
                  </label>

                  <span className="text-xs text-neutral-400">
                    {
                      reviewComment.length
                    }
                    /2000
                  </span>

                </div>


                <textarea
                  id="review-comment"
                  value={
                    reviewComment
                  }
                  onChange={(
                    event,
                  ) =>
                    setReviewComment(
                      event.target.value,
                    )
                  }
                  maxLength={
                    2000
                  }
                  rows={6}
                  placeholder="Tell other customers about your experience with this product..."
                  disabled={
                    submittingReview
                  }
                  className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-100"
                />

              </div>


              {/* Error */}
              {reviewError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {
                    reviewError
                  }
                </div>
              )}


              {/* Success */}
              {reviewSuccess && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {
                    reviewSuccess
                  }
                </div>
              )}


              {/* Actions */}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closeReviewModal
                  }
                  disabled={
                    submittingReview
                  }
                  className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>


                {!reviewSuccess && (
                  <button
                    type="button"
                    onClick={
                      handleSubmitReview
                    }
                    disabled={
                      submittingReview
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {submittingReview ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Submitting...
                      </>
                    ) : (
                      <>
                        <Star
                          size={16}
                        />

                        Submit Review
                      </>
                    )}

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
