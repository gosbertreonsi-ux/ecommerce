import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CreditCard,
  Eye,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  getAdminPayment,
  getAdminPayments,
  updateAdminPaymentStatus,
  type AdminPayment,
  type PaymentMethod,
  type PaymentStatus,
} from "../../../api/admin/payments.api";

const statuses: PaymentStatus[] = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
];

const methods: PaymentMethod[] = [
  "CASH",
  "CARD",
  "MOBILE_MONEY",
];

const statusStyles: Record<
  PaymentStatus,
  string
> = {
  PENDING:
    "bg-amber-100 text-amber-700",
  SUCCESS:
    "bg-emerald-100 text-emerald-700",
  FAILED:
    "bg-red-100 text-red-700",
  REFUNDED:
    "bg-violet-100 text-violet-700",
};

const methodStyles: Record<
  PaymentMethod,
  string
> = {
  CASH:
    "bg-slate-100 text-slate-700",
  CARD:
    "bg-blue-100 text-blue-700",
  MOBILE_MONEY:
    "bg-indigo-100 text-indigo-700",
};

const formatStatus = (
  status: PaymentStatus,
) => {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
};

const formatMethod = (
  method: PaymentMethod,
) => {
  if (method === "MOBILE_MONEY") {
    return "Mobile Money";
  }

  return (
    method.charAt(0) +
    method.slice(1).toLowerCase()
  );
};

const formatCurrency = (
  value: number | string,
) => {
  return new Intl.NumberFormat(
    "en-TZ",
    {
      style: "currency",
      currency: "TZS",
      maximumFractionDigits: 0,
    },
  ).format(Number(value));
};

const AdminPaymentsPage = () => {
  const [payments, setPayments] =
    useState<AdminPayment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      PaymentStatus | "ALL"
    >("ALL");

  const [methodFilter, setMethodFilter] =
    useState<
      PaymentMethod | "ALL"
    >("ALL");

  const [error, setError] =
    useState<string | null>(null);

  const [selectedPayment, setSelectedPayment] =
    useState<AdminPayment | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getAdminPayments();

      setPayments(data);
    } catch (err) {
      console.error(
        "Failed to load payments:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payments.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  const filteredPayments =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return payments.filter(
        (payment) => {
          const customerName =
            payment.order?.user
              ? `${payment.order.user.firstName} ${payment.order.user.lastName}`
              : "";

          const matchesSearch =
            !query ||
            payment.order?.orderNumber
              .toLowerCase()
              .includes(query) ||
            payment.transactionId
              ?.toLowerCase()
              .includes(query) ||
            customerName
              .toLowerCase()
              .includes(query) ||
            payment.order?.user?.email
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "ALL" ||
            payment.status ===
              statusFilter;

          const matchesMethod =
            methodFilter === "ALL" ||
            payment.method ===
              methodFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesMethod
          );
        },
      );
    }, [
      payments,
      search,
      statusFilter,
      methodFilter,
    ]);

  const summary = useMemo(() => {
    const successful =
      payments.filter(
        (payment) =>
          payment.status === "SUCCESS",
      );

    const pending =
      payments.filter(
        (payment) =>
          payment.status === "PENDING",
      );

    const failed =
      payments.filter(
        (payment) =>
          payment.status === "FAILED",
      );

    const successfulAmount =
      successful.reduce(
        (total, payment) =>
          total +
          Number(payment.amount),
        0,
      );

    return {
      total: payments.length,
      successful: successful.length,
      pending: pending.length,
      failed: failed.length,
      successfulAmount,
    };
  }, [payments]);

  const handleStatusChange =
    async (
      payment: AdminPayment,
      status: PaymentStatus,
    ) => {
      if (payment.status === status) {
        return;
      }

      try {
        setUpdatingId(payment.id);
        setError(null);

        const updated =
          await updateAdminPaymentStatus(
            payment.id,
            status,
          );

        setPayments((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
        );

        if (
          selectedPayment?.id ===
          updated.id
        ) {
          setSelectedPayment(updated);
        }
      } catch (err) {
        console.error(
          "Failed to update payment:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to update payment status.",
        );
      } finally {
        setUpdatingId(null);
      }
    };

  const openPayment = async (
    payment: AdminPayment,
  ) => {
    try {
      setSelectedPayment(payment);
      setDetailsLoading(true);

      const fullPayment =
        await getAdminPayment(
          payment.id,
        );

      setSelectedPayment(
        fullPayment,
      );
    } catch (err) {
      console.error(
        "Failed to load payment:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payment details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor transactions and payment
            statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadPayments()
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

          Refresh Payments
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Payments
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.total}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Successful
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {summary.successful}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {formatCurrency(
              summary.successfulAmount,
            )}
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
            Failed
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {summary.failed}
          </p>
        </div>
      </div>

      {/* FILTERS */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_200px_200px]">
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
              placeholder="Search order, transaction or customer..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | PaymentStatus
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

          <select
            value={methodFilter}
            onChange={(event) =>
              setMethodFilter(
                event.target.value as
                  | PaymentMethod
                  | "ALL",
              )
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"
          >
            <option value="ALL">
              All methods
            </option>

            {methods.map(
              (method) => (
                <option
                  key={method}
                  value={method}
                >
                  {formatMethod(method)}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {/* PAYMENT TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Payment Ledger
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Transaction records
            </p>
          </div>

          <CreditCard
            size={20}
            className="text-slate-400"
          />
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : filteredPayments.length ===
          0 ? (
          <div className="p-10 text-center">
            <CreditCard
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No payments found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or
              filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Transaction
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Method
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map(
                  (payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {payment
                            .transactionId ??
                            "No transaction ID"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Payment #{payment.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {payment.order
                            ?.orderNumber ??
                            `Order #${payment.orderId}`}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {payment.order
                            ?.user
                            ? `${payment.order.user.firstName} ${payment.order.user.lastName}`
                            : "Unknown Customer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {payment.order
                            ?.user
                            ?.email ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {formatCurrency(
                          payment.amount,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            methodStyles[
                              payment.method
                            ],
                          ].join(" ")}
                        >
                          {formatMethod(
                            payment.method,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={
                            payment.status
                          }
                          disabled={
                            updatingId ===
                            payment.id
                          }
                          onChange={(
                            event,
                          ) =>
                            void handleStatusChange(
                              payment,
                              event.target
                                .value as PaymentStatus,
                            )
                          }
                          className={[
                            "rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none",
                            statusStyles[
                              payment.status
                            ],
                          ].join(" ")}
                        >
                          {statuses.map(
                            (
                              status,
                            ) => (
                              <option
                                key={
                                  status
                                }
                                value={
                                  status
                                }
                              >
                                {formatStatus(
                                  status,
                                )}
                              </option>
                            ),
                          )}
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              void openPayment(
                                payment,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            <Eye
                              size={15}
                            />

                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYMENT DETAILS */}

      {selectedPayment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  Payment #{selectedPayment.id}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Transaction details
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(null)
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
                  Loading payment details...
                </p>
              </div>
            ) : (
              <div className="space-y-5 p-5 sm:p-6">
                <div className="rounded-xl bg-slate-900 p-5 text-white">
                  <p className="text-sm text-slate-300">
                    Payment Amount
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {formatCurrency(
                      selectedPayment.amount,
                    )}
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                    {formatStatus(
                      selectedPayment.status,
                    )}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Transaction ID
                    </p>

                    <p className="mt-2 break-all text-sm font-medium text-slate-900">
                      {selectedPayment
                        .transactionId ??
                        "Not available"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment Method
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {formatMethod(
                        selectedPayment.method,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {selectedPayment
                        .order
                        ?.orderNumber ??
                        `Order #${selectedPayment.orderId}`}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {selectedPayment
                        .order
                        ?.user
                        ? `${selectedPayment.order.user.firstName} ${selectedPayment.order.user.lastName}`
                        : "Unknown Customer"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedPayment
                        .order
                        ?.user?.email ??
                        "—"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </p>

                  <p className="mt-2 text-sm text-slate-800">
                    {new Date(
                      selectedPayment.createdAt,
                    ).toLocaleString(
                      "en-TZ",
                    )}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Update Payment Status
                  </label>

                  <select
                    value={
                      selectedPayment.status
                    }
                    disabled={
                      updatingId ===
                      selectedPayment.id
                    }
                    onChange={(
                      event,
                    ) =>
                      void handleStatusChange(
                        selectedPayment,
                        event.target
                          .value as PaymentStatus,
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;