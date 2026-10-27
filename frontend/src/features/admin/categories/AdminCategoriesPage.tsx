import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Edit,
  FolderTree,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
  type AdminCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "../../../api/admin/categories.api";

interface CategoryFormProps {
  category?: AdminCategory | null;

  loading: boolean;

  onSubmit: (
    data:
      | CreateCategoryInput
      | UpdateCategoryInput,
  ) => Promise<void>;

  onCancel: () => void;
}

const CategoryForm = ({
  category,
  loading,
  onSubmit,
  onCancel,
}: CategoryFormProps) => {
  const isEditing = Boolean(category);

  const [name, setName] =
    useState(category?.name ?? "");

  const [slug, setSlug] =
    useState(category?.slug ?? "");

  const [description, setDescription] =
    useState(
      category?.description ?? "",
    );

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError(
        "Category name is required.",
      );

      return;
    }

    if (!slug.trim()) {
      setError(
        "Category slug is required.",
      );

      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        description:
          description.trim() || null,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save category.",
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
            ? "Edit Category"
            : "Create Category"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {isEditing
            ? "Update this category."
            : "Add a new product category."}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. Electronics"
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
            placeholder="electronics"
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
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
            placeholder="Describe this category..."
            rows={4}
            disabled={loading}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
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
              ? "Update Category"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] =
    useState<AdminCategory[]>([]);

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

  const [editingCategory, setEditingCategory] =
    useState<AdminCategory | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getAdminCategories();

      setCategories(data);
    } catch (err) {
      console.error(
        "Failed to load categories:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const filteredCategories =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(query) ||
          category.slug
            .toLowerCase()
            .includes(query) ||
          category.description
            ?.toLowerCase()
            .includes(query),
      );
    }, [categories, search]);

  const handleCreate = async (
    data:
      | CreateCategoryInput
      | UpdateCategoryInput,
  ) => {
    setSaving(true);

    try {
      const category =
        await createAdminCategory(
          data as CreateCategoryInput,
        );

      setCategories((current) => [
        category,
        ...current,
      ]);

      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (
    data:
      | CreateCategoryInput
      | UpdateCategoryInput,
  ) => {
    if (!editingCategory) {
      return;
    }

    setSaving(true);

    try {
      const category =
        await updateAdminCategory(
          editingCategory.id,
          data as UpdateCategoryInput,
        );

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? category
            : item,
        ),
      );

      setEditingCategory(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    category: AdminCategory,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category.id);
      setError(null);

      await deleteAdminCategory(
        category.id,
      );

      setCategories((current) =>
        current.filter(
          (item) =>
            item.id !== category.id,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to delete category:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    setShowForm(true);
    setError(null);
  };

  const openEditForm = (
    category: AdminCategory,
  ) => {
    setEditingCategory(category);
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingCategory(null);
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
          <CategoryForm
            category={editingCategory}
            loading={saving}
            onSubmit={
              editingCategory
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
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Organize your products into
            categories.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              void loadCategories()
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

            Add Category
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
            placeholder="Search categories..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Categories
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {categories.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Showing
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {filteredCategories.length}
          </p>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Category Catalogue
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage product categories
            </p>
          </div>

          <FolderTree
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
        ) : filteredCategories.length ===
          0 ? (
          <div className="p-10 text-center">
            <FolderTree
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              {search
                ? "No categories found"
                : "No categories yet"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different search term."
                : "Create your first category to get started."}
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

                Add Category
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Slug
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
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
                {filteredCategories.map(
                  (category) => (
                    <tr
                      key={category.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <FolderTree
                              size={19}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {
                                category.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              ID #
                              {
                                category.id
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          {category.slug}
                        </code>
                      </td>

                      <td className="max-w-[300px] px-5 py-4 text-sm text-slate-600">
                        <span className="line-clamp-2">
                          {category.description ||
                            "No description"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(
                          category.createdAt,
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
                                category,
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Edit
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(
                                category,
                              )
                            }
                            disabled={
                              deletingId ===
                              category.id
                            }
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Delete ${category.name}`}
                          >
                            {deletingId ===
                            category.id ? (
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

export default AdminCategoriesPage;