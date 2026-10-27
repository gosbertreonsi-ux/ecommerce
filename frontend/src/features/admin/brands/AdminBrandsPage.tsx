import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createAdminBrand,
  deleteAdminBrand,
  getAdminBrands,
  updateAdminBrand,
  type AdminBrand,
  type CreateBrandInput,
  type UpdateBrandInput,
} from "../../../api/admin/brands.api";

interface BrandFormProps {
  brand?: AdminBrand | null;

  loading: boolean;

  onSubmit: (
    data:
      | CreateBrandInput
      | UpdateBrandInput,
  ) => Promise<void>;

  onCancel: () => void;
}

const BrandForm = ({
  brand,
  loading,
  onSubmit,
  onCancel,
}: BrandFormProps) => {
  const isEditing = Boolean(brand);

  const [name, setName] =
    useState(brand?.name ?? "");

  const [slug, setSlug] =
    useState(brand?.slug ?? "");

  const [logoUrl, setLogoUrl] =
    useState(brand?.logoUrl ?? "");

  const [description, setDescription] =
    useState(
      brand?.description ?? "",
    );

  const [isActive, setIsActive] =
    useState(brand?.isActive ?? true);

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError(
        "Brand name is required.",
      );

      return;
    }

    if (!slug.trim()) {
      setError(
        "Brand slug is required.",
      );

      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        logoUrl:
          logoUrl.trim() || null,
        description:
          description.trim() || null,
        isActive,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save brand.",
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
          {isEditing
            ? "Edit Brand"
            : "Create Brand"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {isEditing
            ? "Update this brand."
            : "Add a new product brand."}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Brand Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. Samsung"
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Slug
          </label>

          <input
            type="text"
            value={slug}
            onChange={(event) =>
              setSlug(event.target.value)
            }
            placeholder="samsung"
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Logo URL
          </label>

          <input
            type="url"
            value={logoUrl}
            onChange={(event) =>
              setLogoUrl(
                event.target.value,
              )
            }
            placeholder="https://example.com/logo.png"
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />

          <p className="mt-1 text-xs text-slate-500">
            Optional. Use a publicly accessible
            image URL.
          </p>
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            placeholder="Describe this brand..."
            rows={4}
            disabled={loading}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(
                  event.target.checked,
                )
              }
              disabled={loading}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />

            <span>
              <span className="block text-sm font-medium text-slate-800">
                Active Brand
              </span>

              <span className="block text-xs text-slate-500">
                Allow this brand to be used
                in the store.
              </span>
            </span>
          </label>
        </div>
      </div>

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
          disabled={loading}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Brand"
              : "Create Brand"}
        </button>
      </div>
    </form>
  );
};

const AdminBrandsPage = () => {
  const [brands, setBrands] =
    useState<AdminBrand[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [editingBrand, setEditingBrand] =
    useState<AdminBrand | null>(null);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getAdminBrands();

      setBrands(data);
    } catch (err) {
      console.error(
        "Failed to load brands:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load brands.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBrands();
  }, []);

  const filteredBrands =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return brands;
      }

      return brands.filter(
        (brand) =>
          brand.name
            .toLowerCase()
            .includes(query) ||
          brand.slug
            .toLowerCase()
            .includes(query) ||
          brand.description
            ?.toLowerCase()
            .includes(query),
      );
    }, [brands, search]);

  const activeBrands =
    brands.filter(
      (brand) => brand.isActive,
    ).length;

  const inactiveBrands =
    brands.filter(
      (brand) => !brand.isActive,
    ).length;

  const handleCreate = async (
    data:
      | CreateBrandInput
      | UpdateBrandInput,
  ) => {
    setSaving(true);

    try {
      const brand =
        await createAdminBrand(
          data as CreateBrandInput,
        );

      setBrands((current) => [
        brand,
        ...current,
      ]);

      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (
    data:
      | CreateBrandInput
      | UpdateBrandInput,
  ) => {
    if (!editingBrand) {
      return;
    }

    setSaving(true);

    try {
      const brand =
        await updateAdminBrand(
          editingBrand.id,
          data as UpdateBrandInput,
        );

      setBrands((current) =>
        current.map((item) =>
          item.id === brand.id
            ? brand
            : item,
        ),
      );

      setEditingBrand(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    brand: AdminBrand,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${brand.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(brand.id);
      setError(null);

      await deleteAdminBrand(
        brand.id,
      );

      setBrands((current) =>
        current.filter(
          (item) =>
            item.id !== brand.id,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to delete brand:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete brand.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateForm = () => {
    setEditingBrand(null);
    setShowForm(true);
    setError(null);
  };

  const openEditForm = (
    brand: AdminBrand,
  ) => {
    setEditingBrand(brand);
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingBrand(null);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={closeForm}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <X size={17} />

          Close
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <BrandForm
            brand={editingBrand}
            loading={saving}
            onSubmit={
              editingBrand
                ? handleUpdate
                : handleCreate
            }
            onCancel={closeForm}
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
            Brands
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the brands available in
            your store.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              void loadBrands()
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
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />

            Add Brand
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
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* SEARCH */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-xl">
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
            placeholder="Search brands..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Brands
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {brands.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {activeBrands}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-500">
            {inactiveBrands}
          </p>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Brand Catalogue
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage store brands
            </p>
          </div>

          <BriefcaseBusiness
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
                className="h-16 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : filteredBrands.length ===
          0 ? (
          <div className="p-10 text-center">
            <BriefcaseBusiness
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              {search
                ? "No brands found"
                : "No brands yet"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different search term."
                : "Create your first brand to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={
                  openCreateForm
                }
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus size={17} />

                Add Brand
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Brand
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Slug
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBrands.map(
                  (brand) => (
                    <tr
                      key={brand.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {brand.logoUrl ? (
                            <img
                              src={
                                brand.logoUrl
                              }
                              alt={
                                brand.name
                              }
                              className="h-10 w-10 rounded-lg border border-slate-200 bg-white object-contain p-1"
                              onError={(
                                event,
                              ) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                              <BriefcaseBusiness
                                size={
                                  19
                                }
                              />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {
                                brand.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              ID #
                              {
                                brand.id
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          {brand.slug}
                        </code>
                      </td>

                      <td className="max-w-[280px] px-5 py-4 text-sm text-slate-600">
                        <span className="line-clamp-2">
                          {brand.description ||
                            "No description"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            brand.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {brand.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(
                          brand.createdAt,
                        ).toLocaleDateString(
                          "en-TZ",
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                brand,
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            aria-label={`Edit ${brand.name}`}
                          >
                            <Edit
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(
                                brand,
                              )
                            }
                            disabled={
                              deletingId ===
                              brand.id
                            }
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Delete ${brand.name}`}
                          >
                            {deletingId ===
                            brand.id ? (
                              <RefreshCw
                                size={
                                  17
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={
                                  17
                                }
                              />
                            )}
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
    </div>
  );
};

export default AdminBrandsPage;