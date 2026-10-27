import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  getAdminOrder,
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from "../../../api/admin/orders.api";

const statuses: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusStyles: Record<
  OrderStatus,
  string
> = {
  PENDING:
    "bg-amber-100 text-amber-700",
  PAID:
    "bg-blue-100 text-blue-700",
  PROCESSING:
    "bg-violet-100 text-violet-700",
  SHIPPED:
    "bg-indigo-100 text-indigo-700",
  DELIVERED:
    "bg-emerald-100 text-emerald-700",
  CANCELLED:
    "bg-red-100 text-red-700",
};

const formatStatus = (
  status: OrderStatus,
) => {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
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

const AdminOrdersPage = () => {
  const [orders, setOrders] =
    useState<AdminOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<OrderStatus | "ALL">(
      "ALL",
    );

  const [error, setError] =
    useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] =
    useState<AdminOrder | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getAdminOrders();

      setOrders(data);
    } catch (err) {
      console.error(
        "Failed to load orders:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const filteredOrders =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return orders.filter(
        (order) => {
          const matchesStatus =
            statusFilter === "ALL" ||
            order.status ===
              statusFilter;

          const customerName =
            order.user
              ? `${order.user.firstName} ${order.user.lastName}`
              : "";

          const matchesSearch =
            !query ||
            order.orderNumber
              .toLowerCase()
              .includes(query) ||
            customerName
              .toLowerCase()
              .includes(query) ||
            order.user?.email
              .toLowerCase()
              .includes(query);

          return (
            matchesStatus &&
            matchesSearch
          );
        },
      );
    }, [
      orders,
      search,
      statusFilter,
    ]);

  const counts = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.status === "PENDING",
      ).length,

      processing: orders.filter(
        (order) =>
          order.status === "PROCESSING",
      ).length,

      shipped: orders.filter(
        (order) =>
          order.status === "SHIPPED",
      ).length,

      delivered: orders.filter(
        (order) =>
          order.status === "DELIVERED",
      ).length,
    };
  }, [orders]);

  const handleStatusChange = async (
    order: AdminOrder,
    status: OrderStatus,
  ) => {
    if (order.status === status) {
      return;
    }

    try {
      setUpdatingId(order.id);
      setError(null);

      const updated =
        await updateAdminOrderStatus(
          order.id,
          status,
        );

      setOrders((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );

      if (
        selectedOrder?.id ===
        updated.id
      ) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error(
        "Failed to update order:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openOrder = async (
    order: AdminOrder,
  ) => {
    try {
      setSelectedOrder(order);
      setDetailsLoading(true);

      const fullOrder =
        await getAdminOrder(order.id);

      setSelectedOrder(fullOrder);
    } catch (err) {
      console.error(
        "Failed to load order:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load order details.",
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
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer orders and
            fulfillment status.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadOrders()
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

          Refresh Orders
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
            Total Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {counts.total}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-600">
            {counts.pending}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Processing
          </p>

          <p className="mt-2 text-2xl font-bold text-violet-600">
            {counts.processing}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Shipped
          </p>

          <p className="mt-2 text-2xl font-bold text-indigo-600">
            {counts.shipped}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Delivered
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {counts.delivered}
          </p>
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
              placeholder="Search order number or customer..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | OrderStatus
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

      {/* ORDERS */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Order Management
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Process and track customer
              orders.
            </p>
          </div>

          <Package
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
        ) : filteredOrders.length ===
          0 ? (
          <div className="p-10 text-center">
            <Package
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No orders found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or
              status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Items
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {
                            order.orderNumber
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          ID #{order.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : "Unknown Customer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {order.user
                            ?.email ?? "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {order.items
                          ?.length ?? 0}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {formatCurrency(
                          order.total,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={
                            order.status
                          }
                          disabled={
                            updatingId ===
                            order.id
                          }
                          onChange={(
                            event,
                          ) =>
                            void handleStatusChange(
                              order,
                              event.target
                                .value as OrderStatus,
                            )
                          }
                          className={[
                            "rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none",
                            statusStyles[
                              order.status
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

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(
                          order.createdAt,
                        ).toLocaleDateString(
                          "en-TZ",
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              void openOrder(
                                order,
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

      {/* DETAILS MODAL */}

      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  Order{" "}
                  {
                    selectedOrder.orderNumber
                  }
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Order details and fulfillment
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
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
                  Loading order details...
                </p>
              </div>
            ) : (
              <div className="space-y-6 p-5 sm:p-6">
                {/* CUSTOMER */}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedOrder.user
                        ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}`
                        : "Unknown Customer"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        selectedOrder
                          .user?.email
                      }
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedOrder
                        .payment
                        ?.method ??
                        "Not recorded"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Status:{" "}
                      {selectedOrder
                        .payment
                        ?.status ??
                        "—"}
                    </p>
                  </div>
                </div>

                {/* SHIPPING */}

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Shipping Address
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedOrder
                      .shippingLabel ??
                      "Shipping Address"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {
                      selectedOrder.shippingStreet
                    }
                    <br />
                    {
                      selectedOrder.shippingCity
                    }
                    ,{" "}
                    {
                      selectedOrder.shippingRegion
                    }
                    <br />
                    {
                      selectedOrder.shippingPostalCode ??
                      ""
                    }{" "}
                    {
                      selectedOrder.shippingCountry
                    }
                  </p>
                </div>

                {/* ITEMS */}

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">
                      Order Items
                    </h3>

                    <span className="text-sm text-slate-500">
                      {
                        selectedOrder
                          .items
                          ?.length
                      }{" "}
                      items
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    {selectedOrder.items?.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b border-slate-100 p-4 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {item.product
                                ?.name ??
                                "Product"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Qty:{" "}
                              {
                                item.quantity
                              }{" "}
                              ×{" "}
                              {formatCurrency(
                                item.price,
                              )}
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(
                              Number(
                                item.price,
                              ) *
                                item.quantity,
                            )}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* TOTAL */}

                <div className="flex items-center justify-between rounded-xl bg-slate-900 p-5 text-white">
                  <span className="text-sm font-medium">
                    Order Total
                  </span>

                  <span className="text-xl font-bold">
                    {formatCurrency(
                      selectedOrder.total,
                    )}
                  </span>
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Update Order Status
                  </label>

                  <select
                    value={
                      selectedOrder.status
                    }
                    disabled={
                      updatingId ===
                      selectedOrder.id
                    }
                    onChange={(
                      event,
                    ) =>
                      void handleStatusChange(
                        selectedOrder,
                        event.target
                          .value as OrderStatus,
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

export default AdminOrdersPage;