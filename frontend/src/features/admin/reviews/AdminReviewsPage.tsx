import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Eye,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import {
  deleteAdminReview,
  getAdminReview,
  getAdminReviews,
  updateAdminReviewStatus,
  type AdminReview,
  type ReviewStatus,
} from "../../../api/admin/reviews.api";

const statuses: ReviewStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

const statusStyles: Record<
  ReviewStatus,
  string
> = {
  PENDING:
    "bg-amber-100 text-amber-700",
  APPROVED:
    "bg-emerald-100 text-emerald-700",
  REJECTED:
    "bg-red-100 text-red-700",
};

const formatStatus = (
  status: ReviewStatus,
) => {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
};

const formatDate = (
  value: string,
) => {
  return new Date(value).toLocaleDateString(
    "en-TZ",
    {
      dateStyle: "medium",
    },
  );
};

const AdminReviewsPage = () => {
  const [reviews, setReviews] =
    useState<AdminReview[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      ReviewStatus | "ALL"
    >("ALL");

  const [selectedReview, setSelectedReview] =
    useState<AdminReview | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const loadReviews = async (
    status?: ReviewStatus,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getAdminReviews(
          status,
        );

      setReviews(data);
    } catch (err) {
      console.error(
        "Failed to load reviews:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reviews.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const filteredReviews =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return reviews.filter(
        (review) => {
          const customerName =
            review.user
              ? `${review.user.firstName} ${review.user.lastName}`
              : "";

          const productName =
            review.product?.name ??
            "";

          const matchesSearch =
            !query ||
            customerName
              .toLowerCase()
              .includes(query) ||
            review.user?.email
              .toLowerCase()
              .includes(query) ||
            productName
              .toLowerCase()
              .includes(query) ||
            review.comment
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "ALL" ||
            review.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      reviews,
      search,
      statusFilter,
    ]);

  const summary = useMemo(() => {
    const pending =
      reviews.filter(
        (review) =>
          review.status === "PENDING",
      ).length;

    const approved =
      reviews.filter(
        (review) =>
          review.status === "APPROVED",
      ).length;

    const rejected =
      reviews.filter(
        (review) =>
          review.status === "REJECTED",
      ).length;

    const average =
      reviews.length > 0
        ? reviews.reduce(
            (total, review) =>
              total + review.rating,
            0,
          ) / reviews.length
        : 0;

    return {
      total: reviews.length,
      pending,
      approved,
      rejected,
      average,
    };
  }, [reviews]);

  const handleFilterChange = async (
    value:
      | ReviewStatus
      | "ALL",
  ) => {
    setStatusFilter(value);

    await loadReviews(
      value === "ALL"
        ? undefined
        : value,
    );
  };

  const openReview = async (
    review: AdminReview,
  ) => {
    try {
      setSelectedReview(review);
      setDetailsLoading(true);
      setError(null);

      const fullReview =
        await getAdminReview(
          review.id,
        );

      setSelectedReview(
        fullReview,
      );
    } catch (err) {
      console.error(
        "Failed to load review:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load review details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusChange =
    async (
      review: AdminReview,
      status: ReviewStatus,
    ) => {
      if (review.status === status) {
        return;
      }

      try {
        setUpdatingId(review.id);
        setError(null);

        const updated =
          await updateAdminReviewStatus(
            review.id,
            status,
          );

        setReviews((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
        );

        if (
          selectedReview?.id ===
          updated.id
        ) {
          setSelectedReview(
            updated,
          );
        }
      } catch (err) {
        console.error(
          "Failed to update review:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to update review status.",
        );
      } finally {
        setUpdatingId(null);
      }
    };

  const handleDelete = async (
    review: AdminReview,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this review?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(review.id);
      setError(null);

      await deleteAdminReview(
        review.id,
      );

      setReviews((current) =>
        current.filter(
          (item) =>
            item.id !== review.id,
        ),
      );

      if (
        selectedReview?.id ===
        review.id
      ) {
        setSelectedReview(null);
      }
    } catch (err) {
      console.error(
        "Failed to delete review:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete review.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStars = (
    rating: number,
  ) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <Star
            key={index}
            size={15}
            className={
              index < rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reviews
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Moderate customer reviews and
            ratings.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadReviews(
              statusFilter === "ALL"
                ? undefined
                : statusFilter,
            )
          }
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh Reviews
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Reviews
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.total}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-600">
            {summary.pending}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Approved
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {summary.approved}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Rejected
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {summary.rejected}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Average Rating
          </p>

          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-bold text-slate-900">
              {summary.average.toFixed(
                1,
              )}
            </p>

            <Star
              size={20}
              className="fill-amber-400 text-amber-400"
            />
          </div>
        </div>
      </div>

      {/* FILTERS */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search customer, product or review..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              void handleFilterChange(
                event.target.value as
                  | ReviewStatus
                  | "ALL",
              )
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"
          >
            <option value="ALL">
              All statuses
            </option>

            {statuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {formatStatus(status)}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {/* REVIEWS */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Customer Reviews
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredReviews.length}{" "}
              review
              {filteredReviews.length ===
              1
                ? ""
                : "s"}{" "}
              shown
            </p>
          </div>

          <Star
            size={20}
            className="text-slate-400"
          />
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : filteredReviews.length ===
          0 ? (
          <div className="p-10 text-center">
            <Star
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No reviews found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or
              filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map(
              (review) => (
                <div
                  key={review.id}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                          {review.user
                            ? `${review.user.firstName.charAt(0)}${review.user.lastName.charAt(0)}`
                            : "U"}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {review.user
                              ? `${review.user.firstName} ${review.user.lastName}`
                              : "Unknown Customer"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {review.user
                              ?.email ??
                              "No email"}
                          </p>
                        </div>

                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            statusStyles[
                              review.status
                            ],
                          ].join(" ")}
                        >
                          {formatStatus(
                            review.status,
                          )}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {review.product
                            ?.name ??
                            "Unknown Product"}
                        </p>

                        <div className="mt-2 flex items-center gap-3">
                          {renderStars(
                            review.rating,
                          )}

                          <span className="text-xs font-medium text-slate-500">
                            {review.rating}/5
                          </span>
                        </div>

                        {review.comment && (
                          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">
                            {review.comment}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(
                            review.createdAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          void openReview(
                            review,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <Eye
                          size={15}
                        />

                        View
                      </button>

                      {review.status !==
                        "APPROVED" && (
                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            review.id
                          }
                          onClick={() =>
                            void handleStatusChange(
                              review,
                              "APPROVED",
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <Check
                            size={15}
                          />

                          Approve
                        </button>
                      )}

                      {review.status !==
                        "REJECTED" && (
                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            review.id
                          }
                          onClick={() =>
                            void handleStatusChange(
                              review,
                              "REJECTED",
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle
                            size={15}
                          />

                          Reject
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          review.id
                        }
                        onClick={() =>
                          void handleDelete(
                            review,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                      >
                        <Trash2
                          size={15}
                        />

                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* REVIEW DETAILS MODAL */}

      {selectedReview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  Review #
                  {
                    selectedReview.id
                  }
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Review details
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReview(
                    null,
                  )
                }
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="p-10 text-center">
                <RefreshCw
                  size={28}
                  className="mx-auto animate-spin text-slate-400"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Loading review details...
                </p>
              </div>
            ) : (
              <div className="space-y-5 p-5 sm:p-6">
                {/* CUSTOMER */}

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {selectedReview.user
                        ? `${selectedReview.user.firstName.charAt(0)}${selectedReview.user.lastName.charAt(0)}`
                        : "U"}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedReview.user
                          ? `${selectedReview.user.firstName} ${selectedReview.user.lastName}`
                          : "Unknown Customer"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {
                          selectedReview
                            .user
                            ?.email
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* PRODUCT */}

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Product
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedReview
                      .product
                      ?.name ??
                      "Unknown Product"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    SKU:{" "}
                    {selectedReview
                      .product
                      ?.sku ?? "—"}
                  </p>
                </div>

                {/* RATING */}

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rating
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    {renderStars(
                      selectedReview.rating,
                    )}

                    <span className="text-sm font-bold text-slate-900">
                      {
                        selectedReview.rating
                      }
                      /5
                    </span>
                  </div>
                </div>

                {/* COMMENT */}

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer Comment
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {selectedReview.comment ??
                      "No comment provided."}
                  </p>
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Review Status
                  </label>

                  <select
                    value={
                      selectedReview.status
                    }
                    disabled={
                      updatingId ===
                      selectedReview.id
                    }
                    onChange={(
                      event,
                    ) =>
                      void handleStatusChange(
                        selectedReview,
                        event.target
                          .value as ReviewStatus,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    {statuses.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {formatStatus(
                            status,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* DATE */}

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submitted
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {formatDate(
                      selectedReview.createdAt,
                    )}
                  </p>
                </div>

                {/* DELETE */}

                <button
                  type="button"
                  disabled={
                    updatingId ===
                    selectedReview.id
                  }
                  onClick={() =>
                    void handleDelete(
                      selectedReview,
                    )
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 size={17} />

                  Delete Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;