import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createAdminProduct,
  deleteAdminProduct,
  deleteProductImage,
  getAdminProductById,
  getAdminProducts,
  getProductImageUrl,
  setPrimaryProductImage,
  updateProductImage,
  updateAdminProduct,
  uploadProductImages,
} from "../../../api/admin/products.api";

import type {
  AdminProduct,
  CreateProductInput,
  ProductImage,
} from "../../../api/admin/products.api";

import {
  getAdminCategories,
} from "../../../api/admin/categories.api";

import type {
  AdminCategory,
} from "../../../api/admin/categories.api";

import {
  getAdminBrands,
} from "../../../api/admin/brands.api";

import type {
  AdminBrand,
} from "../../../api/admin/brands.api";

import ProductForm, {
  type ProductImageChanges,
} from "./ProductForm";

const AdminProductsPage = () => {
  const [products, setProducts] =
    useState<AdminProduct[]>([]);

  const [categories, setCategories] =
    useState<AdminCategory[]>([]);

  const [brands, setBrands] =
    useState<AdminBrand[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<AdminProduct | null>(
      null,
    );

  // ========================================
  // Load products
  // ========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminProducts();

      setProducts(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load products.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Load categories
  // ========================================

  const loadCategories =
    async () => {
      try {
        const data =
          await getAdminCategories();

        setCategories(data);
      } catch (categoryError) {
        setError(
          categoryError instanceof
            Error
            ? categoryError.message
            : "Failed to load categories.",
        );
      }
    };

  // ========================================
  // Load brands
  // ========================================

  const loadBrands =
    async () => {
      try {
        const data =
          await getAdminBrands();

        setBrands(data);
      } catch (brandError) {
        setError(
          brandError instanceof
            Error
            ? brandError.message
            : "Failed to load brands.",
        );
      }
    };

  // ========================================
  // Initial loading
  // ========================================

  useEffect(() => {
    void Promise.all([
      loadProducts(),
      loadCategories(),
      loadBrands(),
    ]);
  }, []);

  // ========================================
  // Filter products
  // ========================================

  const filteredProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(query) ||
          product.sku
            .toLowerCase()
            .includes(query) ||
          product.slug
            .toLowerCase()
            .includes(query),
      );
    }, [
      products,
      search,
    ]);

  // ========================================
  // Create product
  // ========================================

  const handleCreateClick =
    () => {
      setEditingProduct(null);
      setError("");
      setShowForm(true);
    };

  // ========================================
  // Edit product
  // ========================================

  const handleEditClick = async (
    product: AdminProduct,
  ) => {
    try {
      setError("");

      const fullProduct =
        await getAdminProductById(
          product.id,
        );

      setEditingProduct(
        fullProduct,
      );

      setShowForm(true);
    } catch (editError) {
      setError(
        editError instanceof Error
          ? editError.message
          : "Failed to load product.",
      );
    }
  };

  // ========================================
  // Cancel form
  // ========================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingProduct(null);
    setError("");
  };

  // ========================================
  // Synchronize product images
  // ========================================

  const syncProductImages =
    async (
      productId: number,
      changes: ProductImageChanges,
    ): Promise<AdminProduct> => {
      // ------------------------------------
      // Delete existing images
      // ------------------------------------

      for (
        const imageId of
          changes.deletedImageIds
      ) {
        await deleteProductImage(
          productId,
          imageId,
        );
      }

      // ------------------------------------
      // Upload new images
      // ------------------------------------

      let uploadedImages: ProductImage[] =
        [];

      if (
        changes.newImages.length >
        0
      ) {
        uploadedImages =
          await uploadProductImages(
            productId,
            changes.newImages,
          );
      }

      // ------------------------------------
      // Update existing alt text
      // ------------------------------------

      for (
        const image of
          changes.existingImageAltTexts
      ) {
        if (
          changes.deletedImageIds.includes(
            image.id,
          )
        ) {
          continue;
        }

        await updateProductImage(
          productId,
          image.id,
          {
            altText:
              image.altText,
          },
        );
      }

      // ------------------------------------
      // Update new image alt text
      // ------------------------------------

      for (
        let index = 0;
        index <
          uploadedImages.length;
        index++
      ) {
        const uploadedImage =
          uploadedImages[index];

        const altText =
          changes.newImageAltTexts[
            index
          ];

        if (
          uploadedImage &&
          altText !== undefined
        ) {
          await updateProductImage(
            productId,
            uploadedImage.id,
            {
              altText,
            },
          );
        }
      }

      // ------------------------------------
      // Set existing primary image
      // ------------------------------------

      if (
        changes.primaryExistingImageId !==
          null &&
        !changes.deletedImageIds.includes(
          changes.primaryExistingImageId,
        )
      ) {
        await setPrimaryProductImage(
          productId,
          changes.primaryExistingImageId,
        );
      }

      // ------------------------------------
      // Set new primary image
      // ------------------------------------

      if (
        changes.primaryNewImageIndex !==
        null
      ) {
        const primaryNewImage =
          uploadedImages[
            changes.primaryNewImageIndex
          ];

        if (primaryNewImage) {
          await setPrimaryProductImage(
            productId,
            primaryNewImage.id,
          );
        }
      }

      // ------------------------------------
      // Get fresh product
      // ------------------------------------

      return getAdminProductById(
        productId,
      );
    };

  // ========================================
  // Handle create
  // ========================================

  const handleCreate = async (
    data: CreateProductInput,
    imageChanges: ProductImageChanges,
  ) => {
    try {
      setSaving(true);
      setError("");

      const product =
        await createAdminProduct(
          data,
        );

      let finalProduct =
        product;

      try {
        finalProduct =
          await syncProductImages(
            product.id,
            imageChanges,
          );
      } catch (imageError) {
        setError(
          imageError instanceof
            Error
            ? `Product created, but image processing failed: ${imageError.message}`
            : "Product created, but image processing failed.",
        );

        finalProduct =
          await getAdminProductById(
            product.id,
          ).catch(
            () => product,
          );
      }

      setProducts(
        (current) => [
          finalProduct,
          ...current,
        ],
      );

      setShowForm(false);
      setEditingProduct(null);
    } catch (createError) {
      throw createError;
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // Handle update
  // ========================================

  const handleUpdate = async (
    data: CreateProductInput,
    imageChanges: ProductImageChanges,
  ) => {
    if (!editingProduct) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const product =
        await updateAdminProduct(
          editingProduct.id,
          data,
        );

      let finalProduct =
        product;

      try {
        finalProduct =
          await syncProductImages(
            editingProduct.id,
            imageChanges,
          );
      } catch (imageError) {
        setError(
          imageError instanceof
            Error
            ? `Product updated, but image processing failed: ${imageError.message}`
            : "Product updated, but image processing failed.",
        );

        finalProduct =
          await getAdminProductById(
            editingProduct.id,
          ).catch(
            () => product,
          );
      }

      setProducts(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              finalProduct.id
                ? finalProduct
                : item,
          ),
      );

      setShowForm(false);
      setEditingProduct(null);
    } catch (updateError) {
      throw updateError;
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // Delete product
  // ========================================

  const handleDelete = async (
    product: AdminProduct,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteAdminProduct(
        product.id,
      );

      setProducts(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              product.id,
          ),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete product.",
      );
    }
  };

  // ========================================
  // Product form
  // ========================================

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingProduct
                ? "Edit Product"
                : "Create Product"}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {editingProduct
                ? "Update product information, images, variants, and status."
                : "Create a new product and upload its images."}
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleCancel
            }
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={17} />
            Cancel
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <ProductForm
          product={
            editingProduct
          }
          categories={
            categories
          }
          brands={brands}
          onSubmit={
            editingProduct
              ? handleUpdate
              : handleCreate
          }
          onCancel={
            handleCancel
          }
        />
      </div>
    );
  }

  // ========================================
  // Products list
  // ========================================

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your store products,
            variants, pricing, and images.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleCreateClick
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">
              No products found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Create your first product to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    SKU
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Price
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(
                  (product) => {
                    const primaryImage =
                      product.images.find(
                        (image) =>
                          image.isPrimary,
                      ) ??
                      product.images[0];

                    return (
                      <tr
                        key={
                          product.id
                        }
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                              {primaryImage ? (
                                <img
                                  src={getProductImageUrl(
                                    primaryImage.imageUrl,
                                  )}
                                  alt={
                                    primaryImage.altText ??
                                    product.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                  No image
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {
                                  product.name
                                }
                              </p>

                              <p className="truncate text-xs text-gray-500">
                                {
                                  product.slug
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {
                            product.sku
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {
                            product
                              .category
                              ?.name ??
                            "—"
                          }
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {Number(
                            product.price,
                          ).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              product.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                void handleEditClick(
                                  product,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil
                                size={14}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(
                                  product,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2
                                size={14}
                              />
                              Delete
                            </button>
                          </div>
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

export default AdminProductsPage;