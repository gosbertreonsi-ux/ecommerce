import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Boxes,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  getAdminDashboardStats,
  type AdminDashboardStats,
} from "../../../api/admin/dashboard.api";

const formatCurrency = (
  value: number | string,
) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "TZS 0";
  }

  return new Intl.NumberFormat(
    "en-TZ",
    {
      style: "currency",
      currency: "TZS",
      maximumFractionDigits: 0,
    },
  ).format(amount);
};

const formatNumber = (
  value: number,
) => {
  return new Intl.NumberFormat(
    "en-US",
  ).format(value);
};

const getStockStatus = (
  stock: number,
) => {
  if (stock <= 0) {
    return {
      label: "Out of stock",
      className:
        "bg-red-100 text-red-700",
    };
  }

  if (stock <= 2) {
    return {
      label: "Critical",
      className:
        "bg-orange-100 text-orange-700",
    };
  }

  return {
    label: "Low stock",
    className:
      "bg-yellow-100 text-yellow-700",
  };
};

const DashboardPage = () => {
  const [stats, setStats] =
    useState<AdminDashboardStats | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getAdminDashboardStats();

      setStats(data);
    } catch (err) {
      console.error(
        "Failed to load dashboard:",
        err,
      );

      setError(
        "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl bg-white shadow-sm"
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-xl bg-white shadow-sm" />

          <div className="h-80 animate-pulse rounded-xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your e-commerce
            business.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-red-100 p-2 text-red-600">
              <AlertTriangle size={22} />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold text-red-900">
                Dashboard unavailable
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error ??
                  "Dashboard data could not be loaded."}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadDashboard()
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                <RefreshCw size={16} />

                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: "Total Customers",
      value: formatNumber(
        stats.overview.totalCustomers,
      ),
      icon: Users,
      description:
        "Registered customers",
    },
    {
      title: "Total Products",
      value: formatNumber(
        stats.overview.totalProducts,
      ),
      icon: Package,
      description:
        "Products in catalogue",
    },
    {
      title: "Total Orders",
      value: formatNumber(
        stats.overview.totalOrders,
      ),
      icon: ShoppingCart,
      description:
        "All customer orders",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(
        stats.overview.totalRevenue,
      ),
      icon: TrendingUp,
      description:
        "Successful payments",
    },
  ];

  const orderStatuses = [
    {
      label: "Pending",
      value: stats.orders.pending,
      className:
        "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Paid",
      value: stats.orders.paid,
      className:
        "bg-blue-100 text-blue-700",
    },
    {
      label: "Processing",
      value: stats.orders.processing,
      className:
        "bg-purple-100 text-purple-700",
    },
    {
      label: "Shipped",
      value: stats.orders.shipped,
      className:
        "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Delivered",
      value: stats.orders.delivered,
      className:
        "bg-green-100 text-green-700",
    },
    {
      label: "Cancelled",
      value: stats.orders.cancelled,
      className:
        "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your e-commerce
            business.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadDashboard()
          }
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />

          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map(
          ({
            title,
            value,
            icon: Icon,
            description,
          }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {value}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {description}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Order Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current order statuses
              </p>
            </div>

            <ShoppingCart
              size={20}
              className="text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
            {orderStatuses.map(
              ({
                label,
                value,
                className,
              }) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      {label}
                    </span>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}
                    >
                      {value}
                    </span>
                  </div>

                  <p className="mt-3 text-xl font-bold text-slate-900">
                    {formatNumber(value)}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Payment Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Payment transaction statuses
              </p>
            </div>

            <CreditCard
              size={20}
              className="text-slate-400"
            />
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4">
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Pending Payments
                </p>

                <p className="mt-1 text-xs text-yellow-700">
                  Awaiting confirmation
                </p>
              </div>

              <span className="text-2xl font-bold text-yellow-900">
                {formatNumber(
                  stats.payments.pending,
                )}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
              <div>
                <p className="text-sm font-medium text-green-900">
                  Successful Payments
                </p>

                <p className="mt-1 text-xs text-green-700">
                  Completed transactions
                </p>
              </div>

              <span className="text-2xl font-bold text-green-900">
                {formatNumber(
                  stats.payments.successful,
                )}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">
              <div>
                <p className="text-sm font-medium text-red-900">
                  Failed Payments
                </p>

                <p className="mt-1 text-xs text-red-700">
                  Unsuccessful transactions
                </p>
              </div>

              <span className="text-2xl font-bold text-red-900">
                {formatNumber(
                  stats.payments.failed,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
              <Boxes size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Low Stock Inventory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Product variants with 5 or fewer
                units
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
            {formatNumber(
              stats.inventory.lowStockCount,
            )}{" "}
            items
          </span>
        </div>

        {stats.inventory
          .lowStockProducts.length === 0 ? (
          <div className="p-8 text-center">
            <Boxes
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-700">
              Inventory looks healthy
            </p>

            <p className="mt-1 text-sm text-slate-500">
              No products are currently low on
              stock.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Product
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Variant
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    SKU
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Stock
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {stats.inventory.lowStockProducts.map(
                  (variant) => {
                    const status =
                      getStockStatus(
                        variant.stock,
                      );

                    return (
                      <tr
                        key={variant.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-900">
                            {
                              variant.product
                                .name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Product #
                            {
                              variant.product
                                .id
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700">
                            {variant.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {variant.value}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {variant.sku}
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-slate-900">
                            {variant.stock}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;