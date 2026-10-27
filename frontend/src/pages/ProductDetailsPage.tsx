import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import Container from "../components/Container";
import Button from "../components/Button";

import {
  getProduct,
} from "../api/products.api";

import type {
  Product,
} from "../types/product";

import {
  useCartStore,
} from "../stores/cartStore";

import {
  useAuth,
} from "../context/AuthContext";


function getProductImageUrl(
  imageUrl: string,
): string {
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  const apiBase =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

  const backendOrigin =
    apiBase.replace(
      /\/api\/?$/,
      "",
    );

  return `${backendOrigin}${
    imageUrl.startsWith("/")
      ? imageUrl
      : `/${imageUrl}`
  }`;
}


function ProductDetailsPage() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const { token } =
    useAuth();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [adding, setAdding] =
    useState(false);

  const [buying, setBuying] =
    useState(false);

  const [selectedVariantId, setSelectedVariantId] =
    useState<number | null>(null);

  const [quantity, setQuantity] =
    useState(1);

  const addItem =
    useCartStore(
      (state) => state.addItem,
    );


  // ============================================================
  // LOAD PRODUCT
  // ============================================================

  useEffect(() => {
    const loadProduct =
      async () => {
        if (!id) {
          setError(
            "Product ID is missing.",
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);

          const data =
            await getProduct(
              Number(id),
            );

          setProduct(data);

          /*
          |----------------------------------------------------------
          | DEFAULT VARIANT
          |----------------------------------------------------------
          */

          const firstAvailableVariant =
            data.variants.find(
              (variant) =>
                Number(
                  variant.stock,
                ) > 0,
            );

          setSelectedVariantId(
            firstAvailableVariant
              ? firstAvailableVariant.id
              : data.variants[0]?.id ??
                  null,
          );

          setQuantity(1);

          setError(null);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load product.",
          );
        } finally {
          setLoading(false);
        }
      };

    void loadProduct();
  }, [id]);


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Container className="py-20">
        <p className="text-neutral-500">
          Loading product...
        </p>
      </Container>
    );
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error || !product) {
    return (
      <Container className="py-20">
        <h1 className="text-2xl font-bold">
          Product not found
        </h1>

        <p className="mt-2 text-neutral-600">
          {error ||
            "The product could not be found."}
        </p>

        <Link
          to="/products"
          className="mt-4 inline-block underline"
        >
          Back to products
        </Link>
      </Container>
    );
  }


  // ============================================================
  // PRODUCT IMAGE
  // ============================================================

  const image =
    product.images.find(
      (item) =>
        item.isPrimary,
    )?.imageUrl ??
    product.images[0]?.imageUrl ??
    "https://placehold.co/800x800?text=No+Image";

  const imageUrl =
    getProductImageUrl(image);


  // ============================================================
  // TOTAL STOCK
  // ============================================================

  const stock =
    product.variants.reduce(
      (total, variant) =>
        total + Number(variant.stock),
      0,
    );


  // ============================================================
  // SELECTED VARIANT
  // ============================================================

  const selectedVariant =
    product.variants.find(
      (variant) =>
        variant.id ===
        selectedVariantId,
    );

  const selectedStock =
    selectedVariant
      ? Number(
          selectedVariant.stock,
        )
      : 0;


  // ============================================================
  // VARIANT SELECTION
  // ============================================================

  const handleVariantSelect =
    (
      variantId: number,
    ) => {
      setSelectedVariantId(
        variantId,
      );

      setQuantity(1);
    };


  // ============================================================
  // QUANTITY
  // ============================================================

  const decreaseQuantity =
    () => {
      setQuantity(
        (current) =>
          Math.max(
            1,
            current - 1,
          ),
      );
    };

  const increaseQuantity =
    () => {
      if (
        selectedStock <= 0
      ) {
        return;
      }

      setQuantity(
        (current) =>
          Math.min(
            selectedStock,
            current + 1,
          ),
      );
    };


  // ============================================================
  // ADD TO CART
  // ============================================================

  const handleAddToCart =
    async () => {
      if (!product) {
        return;
      }

      if (!token) {
        alert(
          "Please login before adding products to your cart.",
        );

        return;
      }

      if (!selectedVariant) {
        alert(
          "Please select a product variant.",
        );

        return;
      }

      if (
        selectedVariant.stock <=
        0
      ) {
        alert(
          "This variant is currently out of stock.",
        );

        return;
      }

      if (
        quantity >
        selectedVariant.stock
      ) {
        alert(
          `Only ${selectedVariant.stock} items are available.`,
        );

        return;
      }

      try {
        setAdding(true);

        await addItem(
          product,
          selectedVariant.id,
          token,
          quantity,
        );

        alert(
          `${product.name} (${selectedVariant.name}: ${selectedVariant.value}) added to cart`,
        );
      } catch (err) {
        console.error(
          "ADD TO CART ERROR:",
          err,
        );

        alert(
          err instanceof Error
            ? err.message
            : "Failed to add product to cart.",
        );
      } finally {
        setAdding(false);
      }
    };


  // ============================================================
  // BUY NOW
  // ============================================================

  const handleBuyNow =
    async () => {
      if (!product) {
        return;
      }

      if (!token) {
        alert(
          "Please login before buying products.",
        );

        navigate("/login");

        return;
      }

      if (!selectedVariant) {
        alert(
          "Please select a product variant.",
        );

        return;
      }

      if (
        selectedVariant.stock <=
        0
      ) {
        alert(
          "This variant is currently out of stock.",
        );

        return;
      }

      if (
        quantity >
        selectedVariant.stock
      ) {
        alert(
          `Only ${selectedVariant.stock} items are available.`,
        );

        return;
      }

      try {
        setBuying(true);

        await addItem(
          product,
          selectedVariant.id,
          token,
          quantity,
        );

        navigate("/checkout");
      } catch (err) {
        console.error(
          "BUY NOW ERROR:",
          err,
        );

        alert(
          err instanceof Error
            ? err.message
            : "Failed to start purchase.",
        );
      } finally {
        setBuying(false);
      }
    };


  // ============================================================
  // PAGE
  // ============================================================

  return (
    <section className="py-12 sm:py-16">

      <Container>

        {/* BACK */}

        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black"
        >
          <ArrowLeft
            size={16}
          />

          Back to products
        </Link>


        <div className="grid gap-10 lg:grid-cols-2">

          {/* IMAGE */}

          <div className="overflow-hidden rounded-2xl bg-neutral-100">

            <img
              src={imageUrl}
              alt={
                product.images.find(
                  (item) =>
                    item.isPrimary,
                )?.altText ||
                product.name
              }
              className="aspect-square h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src =
                  "https://placehold.co/800x800?text=No+Image";
              }}
            />

          </div>


          {/* DETAILS */}

          <div className="flex flex-col justify-center">

            <p className="text-sm text-neutral-500">
              {product.category.name}
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              {product.name}
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              SKU: {product.sku}
            </p>

            <p className="mt-6 text-3xl font-bold">
              TZS{" "}
              {Number(
                product.price,
              ).toLocaleString()}
            </p>

            <p className="mt-6 leading-7 text-neutral-600">
              {product.description}
            </p>


            {/* TOTAL STOCK */}

            <p className="mt-6 text-sm">
              {stock > 0
                ? `${stock} items available`
                : "Out of stock"}
            </p>


            {/* VARIANTS */}

            {product.variants.length >
              0 && (
              <div className="mt-6">

                <h3 className="font-semibold">
                  Select an option
                </h3>

                <div className="mt-3 grid gap-3">

                  {product.variants.map(
                    (variant) => {
                      const isSelected =
                        variant.id ===
                        selectedVariantId;

                      const variantStock =
                        Number(
                          variant.stock,
                        );

                      const isOutOfStock =
                        variantStock <=
                        0;

                      return (
                        <button
                          key={
                            variant.id
                          }
                          type="button"
                          disabled={
                            isOutOfStock
                          }
                          onClick={() =>
                            handleVariantSelect(
                              variant.id,
                            )
                          }
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                            isSelected
                              ? "border-black bg-black text-white"
                              : "border-neutral-200 bg-white hover:border-neutral-400"
                          } ${
                            isOutOfStock
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                        >

                          <div>

                            <p className="font-medium">
                              {
                                variant.name
                              }
                            </p>

                            <p
                              className={`text-sm ${
                                isSelected
                                  ? "text-neutral-300"
                                  : "text-neutral-500"
                              }`}
                            >
                              {
                                variant.value
                              }
                            </p>

                            <p
                              className={`mt-1 text-xs ${
                                isSelected
                                  ? "text-neutral-300"
                                  : "text-neutral-400"
                              }`}
                            >
                              SKU:{" "}
                              {
                                variant.sku
                              }
                            </p>

                          </div>

                          <span className="text-sm">

                            {isOutOfStock
                              ? "Out of stock"
                              : `${variantStock} available`}

                          </span>

                        </button>
                      );
                    },
                  )}

                </div>


                {/* SELECTED VARIANT */}

                {selectedVariant && (
                  <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-sm">

                    <span className="font-medium">
                      Selected:
                    </span>{" "}

                    {
                      selectedVariant.name
                    }

                    :{" "}

                    {
                      selectedVariant.value
                    }

                  </div>
                )}

              </div>
            )}


            {/* QUANTITY */}

            {selectedVariant && (
              <div className="mt-6">

                <h3 className="font-semibold">
                  Quantity
                </h3>

                <div className="mt-3 inline-flex items-center overflow-hidden rounded-lg border border-neutral-200">

                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="p-3 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus
                      size={16}
                    />
                  </button>

                  <span className="min-w-12 text-center font-medium">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                        selectedStock ||
                      selectedStock <=
                        0
                    }
                    className="p-3 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus
                      size={16}
                    />
                  </button>

                </div>

                {selectedVariant && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Maximum available:
                    {" "}
                    {selectedStock}
                  </p>
                )}

              </div>
            )}


            {/* ACTIONS */}

            <div className="mt-8 flex flex-wrap gap-4">

              <Button
                disabled={
                  !selectedVariant ||
                  selectedStock <=
                    0 ||
                  adding ||
                  buying ||
                  !token
                }
                onClick={
                  handleAddToCart
                }
              >
                <ShoppingCart
                  size={18}
                />

                {adding
                  ? "Adding..."
                  : "Add to cart"}
              </Button>


              <Button
                variant="secondary"
                disabled={
                  !selectedVariant ||
                  selectedStock <=
                    0 ||
                  adding ||
                  buying
                }
                onClick={
                  handleBuyNow
                }
              >
                {buying
                  ? "Processing..."
                  : "Buy now"}
              </Button>

            </div>


            {!token && (
              <p className="mt-3 text-sm text-red-500">
                Please login to purchase products.
              </p>
            )}

          </div>

        </div>

      </Container>

    </section>
  );
}


export default ProductDetailsPage;