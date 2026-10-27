import {
  useEffect,
  useState,
} from "react";

import {
  getProductImageUrl,
} from "../../../api/admin/products.api";

import type {
  AdminProduct,
  CreateProductInput,
  ProductImage,
  ProductVariant,
} from "../../../api/admin/products.api";

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

export interface ProductImageChanges {
  newImages: File[];

  deletedImageIds: number[];

  primaryExistingImageId:
    | number
    | null;

  primaryNewImageIndex:
    | number
    | null;

  existingImageAltTexts: Array<{
    id: number;
    altText: string;
  }>;

  newImageAltTexts: string[];
}

interface ProductFormProps {
  product?: AdminProduct | null;

  categories: Category[];

  brands: Brand[];

  onSubmit: (
    data: CreateProductInput,
    imageChanges: ProductImageChanges,
  ) => Promise<void>;

  onCancel: () => void;
}

interface SelectedImage {
  file: File;
  previewUrl: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface ExistingImage {
  id: number;
  imageUrl: string;
  altText: string | null;
  originalAltText: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

interface VariantForm {
  id?: number;
  name: string;
  value: string;
  sku: string;
  stock: string;
}

const MAX_IMAGES = 10;

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const createEmptyVariant =
  (): VariantForm => ({
    name: "",
    value: "",
    sku: "",
    stock: "0",
  });

const ProductForm = ({
  product,
  categories,
  brands,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  const isEditing =
    Boolean(product);

  // ========================================
  // Product state
  // ========================================

  const [name, setName] =
    useState(
      product?.name ?? "",
    );

  const [slug, setSlug] =
    useState(
      product?.slug ?? "",
    );

  const [
    description,
    setDescription,
  ] = useState(
    product?.description ?? "",
  );

  const [sku, setSku] =
    useState(
      product?.sku ?? "",
    );

  const [brandId, setBrandId] =
    useState<string>(
      product?.brandId?.toString() ??
        "",
    );

  const [
    categoryId,
    setCategoryId,
  ] = useState<string>(
    product?.categoryId?.toString() ??
      "",
  );

  const [price, setPrice] =
    useState<string>(
      product
        ? String(product.price)
        : "",
    );

  const [
    costPrice,
    setCostPrice,
  ] = useState<string>(
    product?.costPrice != null
      ? String(product.costPrice)
      : "",
  );

  const [
    isFeatured,
    setIsFeatured,
  ] = useState(
    product?.isFeatured ??
      false,
  );

  const [
    isActive,
    setIsActive,
  ] = useState(
    product?.isActive ??
      true,
  );

  // ========================================
  // Variant state
  // ========================================

  const [
    variants,
    setVariants,
  ] = useState<VariantForm[]>(
    product
      ? product.variants?.map(
          (variant) => ({
            id: variant.id,
            name: variant.name,
            value: variant.value,
            sku: variant.sku,
            stock: String(
              variant.stock,
            ),
          }),
        ) ?? []
      : [createEmptyVariant()],
  );

  // ========================================
  // Image state
  // ========================================

  const [
    selectedImages,
    setSelectedImages,
  ] = useState<SelectedImage[]>(
    [],
  );

  const [
    existingImages,
    setExistingImages,
  ] = useState<ExistingImage[]>(
    product?.images?.map(
      (image: ProductImage) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText,
        originalAltText:
          image.altText,
        isPrimary:
          image.isPrimary,
        displayOrder:
          image.displayOrder,
      }),
    ) ?? [],
  );

  const [
    deletedImageIds,
    setDeletedImageIds,
  ] = useState<number[]>(
    [],
  );

  // ========================================
  // UI state
  // ========================================

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================
  // Cleanup previews
  // ========================================

  useEffect(() => {
    return () => {
      selectedImages.forEach(
        (image) => {
          URL.revokeObjectURL(
            image.previewUrl,
          );
        },
      );
    };
  }, [selectedImages]);

  // ========================================
  // Slug
  // ========================================

  const generateSlug = (
    value: string,
  ) => {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        "",
      )
      .replace(
        /\s+/g,
        "-",
      )
      .replace(
        /-+/g,
        "-",
      );
  };

  const handleNameChange = (
    value: string,
  ) => {
    setName(value);

    if (!isEditing) {
      setSlug(
        generateSlug(value),
      );
    }
  };

  // ========================================
  // Variants
  // ========================================

  const addVariant = () => {
    setVariants(
      (current) => [
        ...current,
        createEmptyVariant(),
      ],
    );
  };

  const updateVariant = (
    index: number,
    field: keyof VariantForm,
    value: string,
  ) => {
    setVariants(
      (current) =>
        current.map(
          (
            variant,
            variantIndex,
          ) =>
            variantIndex ===
            index
              ? {
                  ...variant,
                  [field]:
                    value,
                }
              : variant,
        ),
    );
  };

  const removeVariant = (
    index: number,
  ) => {
    setVariants(
      (current) =>
        current.filter(
          (
            _,
            variantIndex,
          ) =>
            variantIndex !==
            index,
        ),
    );
  };

  // ========================================
  // Select images
  // ========================================

  const handleImageSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      event.target.files ?? [],
    );

    if (!files.length) {
      return;
    }

    setError("");

    const currentTotal =
      existingImages.length +
      selectedImages.length;

    if (
      currentTotal +
        files.length >
      MAX_IMAGES
    ) {
      setError(
        `You can have a maximum of ${MAX_IMAGES} images.`,
      );

      event.target.value = "";

      return;
    }

    const validImages: SelectedImage[] =
      [];

    for (const file of files) {
      const isValidType =
        [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ].includes(
          file.type,
        );

      if (!isValidType) {
        setError(
          `${file.name}: only JPG, JPEG, PNG, and WebP images are allowed.`,
        );

        continue;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setError(
          `${file.name}: image size must be 5 MB or less.`,
        );

        continue;
      }

      const previewUrl =
        URL.createObjectURL(
          file,
        );

      validImages.push({
        file,
        previewUrl,
        altText:
          name.trim() ||
          file.name,
        isPrimary:
          existingImages.length ===
            0 &&
          selectedImages.length ===
            0 &&
          validImages.length ===
            0,
        displayOrder:
          existingImages.length +
          selectedImages.length +
          validImages.length +
          1,
      });
    }

    if (
      validImages.length >
      0
    ) {
      setSelectedImages(
        (current) => [
          ...current,
          ...validImages,
        ],
      );
    }

    event.target.value = "";
  };

  // ========================================
  // Existing image actions
  // ========================================

  const removeExistingImage = (
    imageId: number,
  ) => {
    setExistingImages(
      (current) =>
        current.filter(
          (image) =>
            image.id !==
            imageId,
        ),
    );

    setDeletedImageIds(
      (current) =>
        current.includes(
          imageId,
        )
          ? current
          : [
              ...current,
              imageId,
            ],
    );
  };

  const setExistingPrimary = (
    imageId: number,
  ) => {
    setExistingImages(
      (current) =>
        current.map(
          (image) => ({
            ...image,
            isPrimary:
              image.id ===
              imageId,
          }),
        ),
    );

    setSelectedImages(
      (current) =>
        current.map(
          (image) => ({
            ...image,
            isPrimary:
              false,
          }),
        ),
    );
  };

  const updateExistingAltText =
    (
      imageId: number,
      altText: string,
    ) => {
      setExistingImages(
        (current) =>
          current.map(
            (image) =>
              image.id ===
              imageId
                ? {
                    ...image,
                    altText,
                  }
                : image,
          ),
      );
    };

  // ========================================
  // Selected image actions
  // ========================================

  const removeSelectedImage = (
    index: number,
  ) => {
    setSelectedImages(
      (current) => {
        const image =
          current[index];

        if (image) {
          URL.revokeObjectURL(
            image.previewUrl,
          );
        }

        const remaining =
          current.filter(
            (
              _,
              imageIndex,
            ) =>
              imageIndex !==
              index,
          );

        return remaining.map(
          (
            selectedImage,
            imageIndex,
          ) => ({
            ...selectedImage,
            displayOrder:
              existingImages.length +
              imageIndex +
              1,
          }),
        );
      },
    );
  };

  const setSelectedPrimary = (
    index: number,
  ) => {
    setSelectedImages(
      (current) =>
        current.map(
          (
            image,
            imageIndex,
          ) => ({
            ...image,
            isPrimary:
              imageIndex ===
              index,
          }),
        ),
    );

    setExistingImages(
      (current) =>
        current.map(
          (image) => ({
            ...image,
            isPrimary:
              false,
          }),
        ),
    );
  };

  const updateSelectedAltText =
    (
      index: number,
      altText: string,
    ) => {
      setSelectedImages(
        (current) =>
          current.map(
            (
              image,
              imageIndex,
            ) =>
              imageIndex ===
              index
                ? {
                    ...image,
                    altText,
                  }
                : image,
          ),
      );
    };

  // ========================================
  // Submit
  // ========================================

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError("");

    // --------------------------------------
    // Basic product validation
    // --------------------------------------

    const trimmedName =
      name.trim();

    const trimmedSlug =
      slug.trim();

    const trimmedDescription =
      description.trim();

    const trimmedSku =
      sku.trim();

    if (!trimmedName) {
      setError(
        "Product name is required.",
      );

      return;
    }

    if (!trimmedSlug) {
      setError(
        "Product slug is required.",
      );

      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
      setError(
        "Product slug must contain only lowercase letters, numbers, and hyphens.",
      );

      return;
    }

    if (!trimmedDescription) {
      setError(
        "Product description is required.",
      );

      return;
    }

    if (!trimmedSku) {
      setError(
        "Product SKU is required.",
      );

      return;
    }

    if (!categoryId) {
      setError(
        "Please select a category.",
      );

      return;
    }

    // --------------------------------------
    // Price validation
    // --------------------------------------

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(
        numericPrice,
      ) ||
      numericPrice <= 0
    ) {
      setError(
        "Please enter a valid product price greater than zero.",
      );

      return;
    }

    const numericCostPrice =
      costPrice.trim() ===
      ""
        ? null
        : Number(costPrice);

    if (
      numericCostPrice !==
        null &&
      (!Number.isFinite(
        numericCostPrice,
      ) ||
        numericCostPrice <= 0)
    ) {
      setError(
        "Please enter a valid cost price greater than zero.",
      );

      return;
    }

    // --------------------------------------
    // Variant validation
    // --------------------------------------

    if (
      isActive &&
      variants.length === 0
    ) {
      setError(
        "Please add at least one variant to an active product.",
      );

      return;
    }

    const normalizedVariants: ProductVariant[] =
      [];

    const variantSkus =
      new Set<string>();

    for (
      let index = 0;
      index <
      variants.length;
      index++
    ) {
      const variant =
        variants[index];

      const variantName =
        variant.name.trim();

      const variantValue =
        variant.value.trim();

      const variantSku =
        variant.sku.trim();

      const stock =
        Number(
          variant.stock,
        );

      if (
        !variantName ||
        !variantValue ||
        !variantSku
      ) {
        setError(
          `Variant ${index + 1}: name, value, and SKU are required.`,
        );

        return;
      }

      if (
        !Number.isInteger(
          stock,
        ) ||
        stock < 0
      ) {
        setError(
          `Variant ${index + 1}: stock must be a non-negative integer.`,
        );

        return;
      }

      const normalizedSku =
        variantSku.toLowerCase();

      if (
        variantSkus.has(
          normalizedSku,
        )
      ) {
        setError(
          `Variant ${index + 1}: duplicate variant SKU.`,
        );

        return;
      }

      variantSkus.add(
        normalizedSku,
      );

      normalizedVariants.push({
        ...(variant.id
          ? {
              id: variant.id,
            }
          : {}),

        name:
          variantName,

        value:
          variantValue,

        sku:
          variantSku,

        stock,
      });
    }

    // --------------------------------------
    // Active product stock validation
    // --------------------------------------

    if (isActive) {
      const hasAvailableStock =
        normalizedVariants.some(
          (variant) =>
            variant.stock > 0,
        );

      if (
        !hasAvailableStock
      ) {
        setError(
          "An active product must have at least one variant with stock greater than zero.",
        );

        return;
      }
    }

    // --------------------------------------
    // Determine primary image
    // --------------------------------------

    const primaryExistingImage =
      existingImages.find(
        (image) =>
          image.isPrimary,
      );

    const primarySelectedIndex =
      selectedImages.findIndex(
        (image) =>
          image.isPrimary,
      );

    // --------------------------------------
    // Build image changes
    // --------------------------------------

    const imageChanges: ProductImageChanges =
      {
        newImages:
          selectedImages.map(
            (image) =>
              image.file,
          ),

        deletedImageIds: [
          ...deletedImageIds,
        ],

        primaryExistingImageId:
          primaryExistingImage?.id ??
          null,

        primaryNewImageIndex:
          primarySelectedIndex >=
          0
            ? primarySelectedIndex
            : null,

        existingImageAltTexts:
          existingImages.map(
            (image) => ({
              id: image.id,
              altText:
                image.altText ??
                "",
            }),
          ),

        newImageAltTexts:
          selectedImages.map(
            (image) =>
              image.altText,
          ),
      };

    // --------------------------------------
    // Build product payload
    // --------------------------------------

    const data: CreateProductInput =
      {
        name:
          trimmedName,

        slug:
          trimmedSlug,

        description:
          trimmedDescription,

        sku:
          trimmedSku,

        brandId:
          brandId === ""
            ? null
            : Number(
                brandId,
              ),

        categoryId:
          Number(
            categoryId,
          ),

        price:
          numericPrice,

        costPrice:
          numericCostPrice,

        isFeatured,

        isActive,

        variants:
          normalizedVariants,
      };

    // --------------------------------------
    // Submit
    // --------------------------------------

    try {
      setSaving(true);

      await onSubmit(
        data,
        imageChanges,
      );
    } catch (
      submitError
    ) {
      setError(
        submitError instanceof
          Error
          ? submitError.message
          : "Failed to save product.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // Render
  // ========================================

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      {/* ================================== */}
      {/* Error */}
      {/* ================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ================================== */}
      {/* Product information */}
      {/* ================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Product Information
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Name */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(
                event,
              ) =>
                handleNameChange(
                  event.target.value,
                )
              }
              placeholder="Enter product name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              disabled={
                saving
              }
            />
          </div>

          {/* Slug */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Slug
            </label>

            <input
              type="text"
              value={slug}
              onChange={(
                event,
              ) =>
                setSlug(
                  event.target.value,
                )
              }
              placeholder="product-slug"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              disabled={
                saving
              }
            />
          </div>

          {/* SKU */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              SKU
            </label>

            <input
              type="text"
              value={sku}
              onChange={(
                event,
              ) =>
                setSku(
                  event.target.value,
                )
              }
              placeholder="SKU-001"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              disabled={
                saving
              }
            />
          </div>

          {/* Category */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              value={
                categoryId
              }
              onChange={(
                event,
              ) =>
                setCategoryId(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              disabled={
                saving
              }
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (
                  category,
                ) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Brand */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Brand
            </label>

            <select
              value={
                brandId
              }
              onChange={(
                event,
              ) =>
                setBrandId(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              disabled={
                saving
              }
            >
              <option value="">
                No brand
              </option>

              {brands.map(
                (brand) => (
                  <option
                    key={
                      brand.id
                    }
                    value={
                      brand.id
                    }
                  >
                    {
                      brand.name
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Description */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={
                description
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={5}
              placeholder="Describe the product..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              disabled={
                saving
              }
            />
          </div>
        </div>
      </section>

      {/* ================================== */}
      {/* Pricing */}
      {/* ================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Pricing
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Price */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Selling Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(
                event,
              ) =>
                setPrice(
                  event.target.value,
                )
              }
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              disabled={
                saving
              }
            />
          </div>

          {/* Cost price */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Cost Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                costPrice
              }
              onChange={(
                event,
              ) =>
                setCostPrice(
                  event.target.value,
                )
              }
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              disabled={
                saving
              }
            />
          </div>
        </div>
      </section>

      {/* ================================== */}
      {/* Images */}
      {/* ================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Product Images
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              JPG, PNG, or WebP · Maximum 5 MB each · Maximum 10 images
            </p>
          </div>

          <span className="text-sm font-medium text-gray-600">
            {existingImages.length +
              selectedImages.length}
            /{MAX_IMAGES}
          </span>
        </div>

        {/* Choose images */}

        <div className="mb-6">
          <label
            className={`inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition ${
              saving ||
              existingImages.length +
                selectedImages.length >=
                MAX_IMAGES
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-gray-50"
            }`}
          >
            Choose Images

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={
                handleImageSelection
              }
              disabled={
                saving ||
                existingImages.length +
                  selectedImages.length >=
                  MAX_IMAGES
              }
              className="hidden"
            />
          </label>
        </div>

        {/* Image grid */}

        {(existingImages.length >
          0 ||
          selectedImages.length >
            0) && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Existing images */}

            {existingImages.map(
              (image) => (
                <div
                  key={`existing-${image.id}`}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={getProductImageUrl(
                        image.imageUrl,
                      )}
                      alt={
                        image.altText ??
                        name
                      }
                      className="h-full w-full object-cover"
                    />

                    {image.isPrimary && (
                      <span className="absolute left-2 top-2 rounded-full bg-black px-2.5 py-1 text-xs font-semibold text-white">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 p-3">
                    <input
                      type="text"
                      value={
                        image.altText ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        updateExistingAltText(
                          image.id,
                          event.target.value,
                        )
                      }
                      placeholder="Alt text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                      disabled={
                        saving
                      }
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExistingPrimary(
                            image.id,
                          )
                        }
                        disabled={
                          saving ||
                          image.isPrimary
                        }
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {image.isPrimary
                          ? "Primary"
                          : "Make Primary"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingImage(
                            image.id,
                          )
                        }
                        disabled={
                          saving
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}

            {/* New images */}

            {selectedImages.map(
              (
                image,
                index,
              ) => (
                <div
                  key={`${image.file.name}-${image.file.size}-${index}`}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={
                        image.previewUrl
                      }
                      alt={
                        image.altText
                      }
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow">
                      New
                    </span>

                    {image.isPrimary && (
                      <span className="absolute right-2 top-2 rounded-full bg-black px-2.5 py-1 text-xs font-semibold text-white">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 p-3">
                    <input
                      type="text"
                      value={
                        image.altText
                      }
                      onChange={(
                        event,
                      ) =>
                        updateSelectedAltText(
                          index,
                          event.target.value,
                        )
                      }
                      placeholder="Alt text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                      disabled={
                        saving
                      }
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPrimary(
                            index,
                          )
                        }
                        disabled={
                          saving ||
                          image.isPrimary
                        }
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {image.isPrimary
                          ? "Primary"
                          : "Make Primary"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeSelectedImage(
                            index,
                          )
                        }
                        disabled={
                          saving
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {/* Empty state */}

        {existingImages.length ===
          0 &&
          selectedImages.length ===
            0 && (
            <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center">
              <p className="text-sm font-medium text-gray-700">
                No product images yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Choose images above to add them to this product.
              </p>
            </div>
          )}
      </section>

      {/* ================================== */}
      {/* Variants */}
      {/* ================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Product Variants
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add sizes, colors, storage options, or other variants.
              Active products require at least one variant with stock.
            </p>
          </div>

          <button
            type="button"
            onClick={
              addVariant
            }
            disabled={
              saving
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Add Variant
          </button>
        </div>

        {variants.length ===
          0 && (
          <div className="rounded-lg border border-dashed border-gray-300 px-6 py-8 text-center text-sm text-gray-500">
            No variants added.
            <div className="mt-3">
              <button
                type="button"
                onClick={
                  addVariant
                }
                disabled={
                  saving
                }
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Add First Variant
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {variants.map(
            (
              variant,
              index,
            ) => (
              <div
                key={
                  variant.id ??
                  `new-${index}`
                }
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Variant{" "}
                    {index + 1}
                  </p>

                  {variants.length >
                    1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeVariant(
                          index,
                        )
                      }
                      disabled={
                        saving
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Variant Name
                    </label>

                    <input
                      type="text"
                      value={
                        variant.name
                      }
                      onChange={(
                        event,
                      ) =>
                        updateVariant(
                          index,
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Color"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                      disabled={
                        saving
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Variant Value
                    </label>

                    <input
                      type="text"
                      value={
                        variant.value
                      }
                      onChange={(
                        event,
                      ) =>
                        updateVariant(
                          index,
                          "value",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Black"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                      disabled={
                        saving
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Variant SKU
                    </label>

                    <input
                      type="text"
                      value={
                        variant.sku
                      }
                      onChange={(
                        event,
                      ) =>
                        updateVariant(
                          index,
                          "sku",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. PROD-BLK-001"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                      disabled={
                        saving
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        variant.stock
                      }
                      onChange={(
                        event,
                      ) =>
                        updateVariant(
                          index,
                          "stock",
                          event.target.value,
                        )
                      }
                      placeholder="Stock"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                      disabled={
                        saving
                      }
                    />
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* ================================== */}
      {/* Status */}
      {/* ================================== */}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Product Status
        </h2>

        <div className="flex flex-col gap-4 sm:flex-row">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={
                isActive
              }
              onChange={(
                event,
              ) =>
                setIsActive(
                  event.target.checked,
                )
              }
              disabled={
                saving
              }
              className="h-4 w-4 rounded border-gray-300"
            />

            <span className="text-sm font-medium text-gray-700">
              Active
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={
                isFeatured
              }
              onChange={(
                event,
              ) =>
                setIsFeatured(
                  event.target.checked,
                )
              }
              disabled={
                saving
              }
              className="h-4 w-4 rounded border-gray-300"
            />

            <span className="text-sm font-medium text-gray-700">
              Featured
            </span>
          </label>
        </div>

        {isActive && (
          <p className="mt-4 text-sm text-gray-500">
            Active products must have at least one variant with available stock.
          </p>
        )}
      </section>

      {/* ================================== */}
      {/* Actions */}
      {/* ================================== */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={
            onCancel
          }
          disabled={
            saving
          }
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            saving
          }
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : isEditing
              ? "Update Product"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;