import React from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";

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


const CartPage = () => {
  const navigate =
    useNavigate();

  const {
    token,
    loading: authLoading,
  } = useAuth();

  const {
    items,
    loading,
    loadCart,
    removeItem,
    updateQuantity,
    getTotal,
  } = useCartStore();


  // ============================================================
  // LOAD CART FROM BACKEND
  // ============================================================

  React.useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!token) {
      return;
    }

    loadCart(token).catch(
      (error) => {
        console.error(
          "Failed to load cart:",
          error,
        );
      },
    );
  }, [
    token,
    authLoading,
    loadCart,
  ]);


  // ============================================================
  // LOADING
  // ============================================================

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="mx-auto max-w-6xl px-6 py-16">

          <div className="flex min-h-[400px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

              <p className="mt-4 text-gray-500">
                Loading your cart...
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }


  // ============================================================
  // EMPTY CART
  // ============================================================

  if (
    items.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="mx-auto max-w-6xl px-6 py-16">

          <div className="flex min-h-[500px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">

                <ShoppingBag
                  size={30}
                  className="text-gray-500"
                />

              </div>

              <h1 className="mt-6 text-2xl font-bold text-gray-900">
                Your cart is empty
              </h1>

              <p className="mt-2 text-gray-500">
                You haven't added any products to your cart yet.
              </p>

              <Link
                to="/products"
                className="mt-6 inline-flex rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                Continue shopping
              </Link>

            </div>

          </div>

        </div>

      </div>
    );
  }


  const total =
    getTotal();


  // ============================================================
  // CART
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>

          <p className="mt-2 text-gray-500">
            Review your products before checkout.
          </p>

        </div>


        <div className="grid gap-8 lg:grid-cols-3">

          {/* ====================================================
              CART ITEMS
          ==================================================== */}

          <div className="space-y-4 lg:col-span-2">

            {items.map(
              (item) => {
                const product =
                  item.product;

                const image =
                  product.images?.find(
                    (image) =>
                      image.isPrimary,
                  )?.imageUrl ??
                  product.images?.[0]
                    ?.imageUrl ??
                  "https://placehold.co/300x300?text=No+Image";

                const imageUrl =
                  getProductImageUrl(
                    image,
                  );

                const variant =
                  product.variants.find(
                    (itemVariant) =>
                      itemVariant.id ===
                      item.variantId,
                  );

                const variantStock =
                  variant
                    ? Number(
                        variant.stock,
                      )
                    : 0;


                return (
                  <div
                    key={`${product.id}-${item.variantId}`}
                    className="rounded-xl border border-gray-200 bg-white p-5"
                  >

                    <div className="flex gap-5">

                      {/* IMAGE */}

                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                        <img
                          src={imageUrl}
                          alt={
                            product.name
                          }
                          className="h-full w-full object-cover"
                          onError={(
                            event,
                          ) => {
                            event.currentTarget.src =
                              "https://placehold.co/300x300?text=No+Image";
                          }}
                        />

                      </div>


                      {/* DETAILS */}

                      <div className="flex min-w-0 flex-1 flex-col justify-between">

                        <div>

                          <Link
                            to={`/products/${product.id}`}
                            className="font-semibold text-gray-900 hover:underline"
                          >
                            {
                              product.name
                            }
                          </Link>


                          {/* VARIANT */}

                          <div className="mt-2 space-y-1">

                            <p className="text-sm text-gray-700">

                              <span className="font-medium">
                                {
                                  item.variantName
                                }
                              </span>

                              :{" "}

                              {
                                item.variantValue
                              }

                            </p>

                            <p className="text-xs text-gray-500">
                              SKU:{" "}
                              {
                                item.variantSku
                              }
                            </p>

                          </div>


                          {/* PRICE */}

                          <p className="mt-2 text-sm text-gray-500">

                            TZS{" "}
                            {Number(
                              product.price,
                            ).toLocaleString()}

                            {" "}per item

                          </p>


                          {/* STOCK */}

                          {variant && (
                            <p
                              className={`mt-1 text-xs ${
                                variantStock >
                                0
                                  ? "text-gray-500"
                                  : "text-red-500"
                              }`}
                            >
                              {variantStock >
                              0
                                ? `${variantStock} available`
                                : "Out of stock"}
                            </p>
                          )}

                        </div>


                        <div className="mt-4 flex items-center justify-between">

                          {/* QUANTITY */}

                          <div className="flex items-center rounded-lg border border-gray-200">

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity -
                                    1,
                                  token ??
                                    undefined,
                                )
                              }
                              disabled={
                                item.quantity <=
                                1
                              }
                              className="p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus
                                size={16}
                              />
                            </button>


                            <span className="min-w-10 text-center text-sm font-medium">
                              {
                                item.quantity
                              }
                            </span>


                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity +
                                    1,
                                  token ??
                                    undefined,
                                )
                              }
                              disabled={
                                variant
                                  ? item.quantity >=
                                    variantStock
                                  : false
                              }
                              className="p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus
                                size={16}
                              />
                            </button>

                          </div>


                          {/* REMOVE */}

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.variantId,
                                token ??
                                  undefined,
                              )
                            }
                            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700"
                          >

                            <Trash2
                              size={16}
                            />

                            Remove

                          </button>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              },
            )}

          </div>


          {/* ====================================================
              SUMMARY
          ==================================================== */}

          <div className="h-fit rounded-xl border border-gray-200 bg-white p-6">

            <h2 className="text-xl font-semibold text-gray-900">
              Order Summary
            </h2>


            <div className="mt-6 space-y-4">

              <div className="flex justify-between text-sm">

                <span className="text-gray-500">
                  Items
                </span>

                <span className="font-medium">
                  {items.reduce(
                    (
                      count,
                      item,
                    ) =>
                      count +
                      item.quantity,
                    0,
                  )}
                </span>

              </div>


              <div className="flex justify-between text-sm">

                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-medium">
                  TZS{" "}
                  {total.toLocaleString()}
                </span>

              </div>


              <div className="border-t border-gray-200 pt-4">

                <div className="flex justify-between">

                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-xl font-bold">
                    TZS{" "}
                    {total.toLocaleString()}
                  </span>

                </div>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/checkout",
                )
              }
              className="mt-6 w-full rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-700"
            >
              Proceed to Checkout
            </button>


            <Link
              to="/products"
              className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-900"
            >
              Continue shopping
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};


export default CartPage;