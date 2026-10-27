import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

import {
  getAdminCustomer,
  getAdminCustomers,
  updateAdminCustomerStatus,
  type AdminCustomer,
} from "../../../api/admin/customers.api";

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

const AdminCustomersPage = () => {
  const [customers, setCustomers] =
    useState<AdminCustomer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(
      null,
    );

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const loadCustomers = async (
    searchValue?: string,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getAdminCustomers(
          searchValue?.trim() || undefined,
        );

      setCustomers(data);
    } catch (err) {
      console.error(
        "Failed to load customers:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const filteredCustomers =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return customers;
      }

      return customers.filter(
        (customer) => {
          const fullName =
            `${customer.firstName} ${customer.lastName}`;

          return (
            fullName
              .toLowerCase()
              .includes(query) ||
            customer.email
              .toLowerCase()
              .includes(query)
          );
        },
      );
    }, [customers, search]);

  const activeCustomers =
    customers.filter(
      (customer) =>
        customer.isActive,
    ).length;

  const inactiveCustomers =
    customers.filter(
      (customer) =>
        !customer.isActive,
    ).length;

  const totalOrders =
    customers.reduce(
      (total, customer) =>
        total +
        (customer._count?.orders ??
          customer.orders?.length ??
          0),
      0,
    );

  const handleSearch = (
    value: string,
  ) => {
    setSearch(value);
  };

  const openCustomer = async (
    customer: AdminCustomer,
  ) => {
    try {
      setSelectedCustomer(customer);
      setDetailsLoading(true);
      setError(null);

      const fullCustomer =
        await getAdminCustomer(
          customer.id,
        );

      setSelectedCustomer(
        fullCustomer,
      );
    } catch (err) {
      console.error(
        "Failed to load customer:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customer details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusChange =
    async (
      customer: AdminCustomer,
    ) => {
      try {
        setUpdatingId(customer.id);
        setError(null);

        const updated =
          await updateAdminCustomerStatus(
            customer.id,
            !customer.isActive,
          );

        setCustomers((current) =>
          current.map((item) =>
            item.id === updated.id
              ? {
                  ...item,
                  ...updated,
                }
              : item,
          ),
        );

        if (
          selectedCustomer?.id ===
          updated.id
        ) {
          setSelectedCustomer(
            updated,
          );
        }
      } catch (err) {
        console.error(
          "Failed to update customer status:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to update customer status.",
        );
      } finally {
        setUpdatingId(null);
      }
    };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer accounts and
            activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadCustomers(
              search,
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

          Refresh Customers
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
            Total Customers
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {customers.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {activeCustomers}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {inactiveCustomers}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalOrders}
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              handleSearch(
                event.target.value,
              )
            }
            placeholder="Search customers by name or email..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      {/* CUSTOMER TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Customer Accounts
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredCustomers.length}{" "}
              customer
              {filteredCustomers.length ===
              1
                ? ""
                : "s"}{" "}
              shown
            </p>
          </div>

          <ShieldCheck
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
        ) : filteredCustomers.length ===
          0 ? (
          <div className="p-10 text-center">
            <Search
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No customers found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try a different search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Orders
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reviews
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Verification
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
                {filteredCustomers.map(
                  (customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                            {customer.firstName.charAt(
                              0,
                            )}
                            {customer.lastName.charAt(
                              0,
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {
                                customer.firstName
                              }{" "}
                              {
                                customer.lastName
                              }
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <Mail
                                size={12}
                              />

                              {
                                customer.email
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-800">
                        {customer._count
                          ?.orders ??
                          customer
                            .orders
                            ?.length ??
                          0}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-800">
                        {customer._count
                          ?.reviews ??
                          customer
                            .reviews
                            ?.length ??
                          0}
                      </td>

                      <td className="px-5 py-4">
                        {customer.emailVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <ShieldCheck
                              size={13}
                            />

                            Verified
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Unverified
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            customer.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700",
                          ].join(" ")}
                        >
                          {customer.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void openCustomer(
                                customer,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            <Eye
                              size={15}
                            />

                            View
                          </button>

                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              customer.id
                            }
                            onClick={() =>
                              void handleStatusChange(
                                customer,
                              )
                            }
                            className={[
                              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50",
                              customer.isActive
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                            ].join(" ")}
                          >
                            {customer.isActive ? (
                              <UserX
                                size={15}
                              />
                            ) : (
                              <UserCheck
                                size={15}
                              />
                            )}

                            {customer.isActive
                              ? "Disable"
                              : "Activate"}
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

      {/* CUSTOMER DETAILS MODAL */}

      {selectedCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {selectedCustomer.firstName.charAt(
                    0,
                  )}
                  {selectedCustomer.lastName.charAt(
                    0,
                  )}
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    {
                      selectedCustomer.firstName
                    }{" "}
                    {
                      selectedCustomer.lastName
                    }
                  </h2>

                  <p className="text-xs text-slate-500">
                    Customer #
                    {
                      selectedCustomer.id
                    }
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(
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
                  Loading customer details...
                </p>
              </div>
            ) : (
              <div className="space-y-6 p-5 sm:p-6">
                {/* BASIC INFO */}

                <section>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Account Information
                  </h3>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Email
                      </p>

                      <p className="mt-2 break-all text-sm text-slate-900">
                        {
                          selectedCustomer.email
                        }
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Joined
                      </p>

                      <p className="mt-2 text-sm text-slate-900">
                        {new Date(
                          selectedCustomer.createdAt,
                        ).toLocaleDateString(
                          "en-TZ",
                          {
                            dateStyle:
                              "medium",
                          },
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Account Status
                      </p>

                      <p
                        className={[
                          "mt-2 text-sm font-semibold",
                          selectedCustomer.isActive
                            ? "text-emerald-600"
                            : "text-red-600",
                        ].join(" ")}
                      >
                        {selectedCustomer.isActive
                          ? "Active"
                          : "Inactive"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Email Verification
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {selectedCustomer.emailVerified
                          ? "Verified"
                          : "Not verified"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* ORDERS */}

                <section>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Orders
                  </h3>

                  {selectedCustomer.orders &&
                  selectedCustomer.orders
                    .length > 0 ? (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                      <div className="divide-y divide-slate-100">
                        {selectedCustomer.orders.map(
                          (
                            order,
                            index,
                          ) => (
                            <div
                              key={
                                order.id ??
                                index
                              }
                              className="flex items-center justify-between px-4 py-3"
                            >
                              <span className="text-sm text-slate-600">
                                Order #
                                {order.id ??
                                  index +
                                    1}
                              </span>

                              <span className="text-sm font-semibold text-slate-900">
                                {formatCurrency(
                                  order.total,
                                )}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No orders found.
                    </p>
                  )}
                </section>

                {/* ADDRESSES */}

                <section>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Addresses
                  </h3>

                  {selectedCustomer.addresses &&
                  selectedCustomer
                    .addresses.length >
                    0 ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {selectedCustomer.addresses.map(
                        (
                          address,
                        ) => (
                          <div
                            key={
                              address.id
                            }
                            className="rounded-xl border border-slate-200 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex gap-2">
                                <MapPin
                                  size={17}
                                  className="mt-0.5 shrink-0 text-slate-400"
                                />

                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {
                                      address.label
                                    }
                                  </p>

                                  <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {
                                      address.street
                                    }
                                    <br />
                                    {
                                      address.city
                                    }
                                    ,{" "}
                                    {
                                      address.region
                                    }
                                    <br />
                                    {
                                      address.country
                                    }

                                    {address.postalCode &&
                                      `, ${address.postalCode}`}
                                  </p>
                                </div>
                              </div>

                              {address.isDefault && (
                                <span className="shrink-0 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No addresses found.
                    </p>
                  )}
                </section>

                {/* REVIEWS */}

                <section>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Reviews
                  </h3>

                  {selectedCustomer.reviews &&
                  selectedCustomer
                    .reviews.length >
                    0 ? (
                    <div className="mt-3 space-y-3">
                      {selectedCustomer.reviews.map(
                        (review) => (
                          <div
                            key={
                              review.id
                            }
                            className="rounded-xl border border-slate-200 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">
                                {
                                  review
                                    .product
                                    ?.name
                                }
                              </p>

                              <span className="text-sm font-bold text-amber-600">
                                ★{" "}
                                {
                                  review.rating
                                }
                                /5
                              </span>
                            </div>

                            {review.comment && (
                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {
                                  review.comment
                                }
                              </p>
                            )}

                            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {
                                review.status
                              }
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No reviews found.
                    </p>
                  )}
                </section>

                {/* ACCOUNT ACTION */}

                <div className="border-t border-slate-200 pt-5">
                  <button
                    type="button"
                    disabled={
                      updatingId ===
                      selectedCustomer.id
                    }
                    onClick={() =>
                      void handleStatusChange(
                        selectedCustomer,
                      )
                    }
                    className={[
                      "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition disabled:opacity-50",
                      selectedCustomer.isActive
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-emerald-600 text-white hover:bg-emerald-700",
                    ].join(" ")}
                  >
                    {selectedCustomer.isActive ? (
                      <UserX size={17} />
                    ) : (
                      <UserCheck
                        size={17}
                      />
                    )}

                    {selectedCustomer.isActive
                      ? "Deactivate Customer"
                      : "Activate Customer"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;