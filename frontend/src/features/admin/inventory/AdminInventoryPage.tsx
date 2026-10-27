import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Boxes,
  PackagePlus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  createInventoryMovement,
  getInventory,
  type CreateInventoryMovementInput,
  type InventoryMovement,
  type InventoryType,
} from "../../../api/admin/inventory.api";

const inventoryTypes: InventoryType[] = [
  "PURCHASE",
  "SALE",
  "RETURN",
  "DAMAGE",
  "ADJUSTMENT",
];

const typeLabels: Record<
  InventoryType,
  string
> = {
  PURCHASE: "Purchase",
  SALE: "Sale",
  RETURN: "Return",
  DAMAGE: "Damage",
  ADJUSTMENT: "Adjustment",
};

const typeStyles: Record<
  InventoryType,
  string
> = {
  PURCHASE:
    "bg-emerald-100 text-emerald-700",
  SALE:
    "bg-blue-100 text-blue-700",
  RETURN:
    "bg-violet-100 text-violet-700",
  DAMAGE:
    "bg-red-100 text-red-700",
  ADJUSTMENT:
    "bg-amber-100 text-amber-700",
};

interface MovementFormProps {
  variants: InventoryMovement[];

  loading: boolean;

  onSubmit: (
    data: CreateInventoryMovementInput,
  ) => Promise<void>;

  onCancel: () => void;
}

const MovementForm = ({
  variants,
  loading,
  onSubmit,
  onCancel,
}: MovementFormProps) => {
  const uniqueVariants = useMemo(() => {
    const map =
      new Map<number, InventoryMovement>();

    variants.forEach((movement) => {
      if (
        movement.variant &&
        !map.has(
          movement.variant.id,
        )
      ) {
        map.set(
          movement.variant.id,
          movement,
        );
      }
    });

    return Array.from(map.values());
  }, [variants]);

  const [variantId, setVariantId] =
    useState("");

  const [quantity, setQuantity] =
    useState("1");

  const [type, setType] =
    useState<InventoryType>("PURCHASE");

  const [note, setNote] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);

    const parsedVariantId =
      Number(variantId);

    const parsedQuantity =
      Number(quantity);

    if (
      !variantId ||
      !Number.isInteger(
        parsedVariantId,
      )
    ) {
      setError(
        "Please select a product variant.",
      );

      return;
    }

    if (
      !Number.isInteger(
        parsedQuantity,
      ) ||
      parsedQuantity <= 0
    ) {
      setError(
        "Quantity must be a positive whole number.",
      );

      return;
    }

    try {
      await onSubmit({
        variantId: parsedVariantId,
        quantity: parsedQuantity,
        type,
        note: note.trim() || null,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create inventory movement.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Record Inventory Movement
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add a stock movement for a
          product variant.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {uniqueVariants.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle
              size={20}
              className="shrink-0 text-amber-600"
            />

            <div>
              <p className="text-sm font-semibold text-amber-800">
                No variants available
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Create product variants before
                recording inventory movements.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Product Variant
            </label>

            <select
              value={variantId}
              onChange={(event) =>
                setVariantId(
                  event.target.value,
                )
              }
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">
                Select variant
              </option>

              {uniqueVariants.map(
                (movement) => {
                  const variant =
                    movement.variant;

                  if (!variant) {
                    return null;
                  }

                  return (
                    <option
                      key={variant.id}
                      value={variant.id}
                    >
                      {variant.product
                        ?.name ??
                        "Product"}{" "}
                      —{" "}
                      {variant.name}{" "}
                      {variant.value}{" "}
                      ({variant.sku}) — Stock:{" "}
                      {variant.stock}
                    </option>
                  );
                },
              )}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Movement Type
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(
                    event.target
                      .value as InventoryType,
                  )
                }
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              >
                {inventoryTypes.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {typeLabels[item]}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    event.target.value,
                  )
                }
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Note
            </label>

            <textarea
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value,
                )
              }
              rows={3}
              placeholder="Optional inventory note..."
              disabled={loading}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            loading ||
            uniqueVariants.length === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <RefreshCw
              size={16}
              className="animate-spin"
            />
          )}

          {loading
            ? "Saving..."
            : "Record Movement"}
        </button>
      </div>
    </form>
  );
};

const AdminInventoryPage = () => {
  const [movements, setMovements] =
    useState<InventoryMovement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState<InventoryType | "ALL">(
      "ALL",
    );

  const [error, setError] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getInventory();

      setMovements(data);
    } catch (err) {
      console.error(
        "Failed to load inventory:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load inventory.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInventory();
  }, []);

  const filteredMovements =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return movements.filter(
        (movement) => {
          const matchesType =
            typeFilter === "ALL" ||
            movement.type ===
              typeFilter;

          const matchesSearch =
            !query ||
            movement.variant?.sku
              .toLowerCase()
              .includes(query) ||
            movement.variant?.name
              .toLowerCase()
              .includes(query) ||
            movement.variant?.value
              .toLowerCase()
              .includes(query) ||
            movement.variant?.product?.name
              .toLowerCase()
              .includes(query) ||
            movement.note
              ?.toLowerCase()
              .includes(query);

          return (
            matchesType &&
            matchesSearch
          );
        },
      );
    }, [
      movements,
      search,
      typeFilter,
    ]);

  const uniqueVariants =
    useMemo(() => {
      const map =
        new Map<
          number,
          NonNullable<
            InventoryMovement["variant"]
          >
        >();

      movements.forEach(
        (movement) => {
          if (movement.variant) {
            map.set(
              movement.variant.id,
              movement.variant,
            );
          }
        },
      );

      return Array.from(
        map.values(),
      );
    }, [movements]);

  const lowStockVariants =
    uniqueVariants.filter(
      (variant) =>
        variant.stock <= 5,
    ).length;

  const totalStock =
    uniqueVariants.reduce(
      (total, variant) =>
        total + variant.stock,
      0,
    );

  const handleCreateMovement =
    async (
      data: CreateInventoryMovementInput,
    ) => {
      setSaving(true);

      try {
        await createInventoryMovement(
          data,
        );

        await loadInventory();

        setShowForm(false);
      } finally {
        setSaving(false);
      }
    };

  if (showForm) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() =>
            setShowForm(false)
          }
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <X size={17} />

          Close
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <MovementForm
            variants={movements}
            loading={saving}
            onSubmit={
              handleCreateMovement
            }
            onCancel={() =>
              setShowForm(false)
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor stock and record inventory
            movements.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              void loadInventory()
            }
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setShowForm(true)
            }
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <PackagePlus size={18} />

            Add Movement
          </button>
        </div>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Variants
            </p>

            <Boxes
              size={20}
              className="text-slate-400"
            />
          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {uniqueVariants.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Stock
            </p>

            <PackagePlus
              size={20}
              className="text-slate-400"
            />
          </div>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {totalStock}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Low Stock
            </p>

            <AlertTriangle
              size={20}
              className="text-amber-500"
            />
          </div>

          <p className="mt-2 text-2xl font-bold text-amber-600">
            {lowStockVariants}
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
              placeholder="Search product, SKU, variant..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target
                  .value as
                  | InventoryType
                  | "ALL",
              )
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"
          >
            <option value="ALL">
              All movements
            </option>

            {inventoryTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {typeLabels[type]}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {/* MOVEMENTS */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Inventory Movements
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Stock movement history
            </p>
          </div>

          <span className="text-xs font-medium text-slate-500">
            {filteredMovements.length} records
          </span>
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : filteredMovements.length ===
          0 ? (
          <div className="p-10 text-center">
            <Boxes
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No inventory movements
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No records match your current
              filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Product
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Variant
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Quantity
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Current Stock
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMovements.map(
                  (movement) => {
                    const variant =
                      movement.variant;

                    return (
                      <tr
                        key={movement.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-900">
                            {variant
                              ?.product
                              ?.name ??
                              "Unknown Product"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            SKU:{" "}
                            {variant
                              ?.product
                              ?.sku ??
                              "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700">
                            {variant
                              ? `${variant.name} ${variant.value}`
                              : "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {variant?.sku ??
                              "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                              typeStyles[
                                movement.type
                              ],
                            ].join(" ")}
                          >
                            {
                              typeLabels[
                                movement
                                  .type
                              ]
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "text-sm font-bold",
                              movement.type ===
                                "SALE" ||
                              movement.type ===
                                "DAMAGE"
                                ? "text-red-600"
                                : "text-emerald-600",
                            ].join(" ")}
                          >
                            {movement.type ===
                              "SALE" ||
                            movement.type ===
                              "DAMAGE"
                              ? "-"
                              : "+"}
                            {
                              movement.quantity
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "text-sm font-semibold",
                              (variant?.stock ??
                                0) <= 5
                                ? "text-amber-600"
                                : "text-slate-900",
                            ].join(" ")}
                          >
                            {variant?.stock ??
                              "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {new Date(
                            movement.createdAt,
                          ).toLocaleString(
                            "en-TZ",
                          )}
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

export default AdminInventoryPage;