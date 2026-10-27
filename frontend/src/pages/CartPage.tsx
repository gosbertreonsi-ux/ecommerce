import { useEffect } from "react";

import { Link } from "react-router-dom";

import { Minus, Plus, Trash2 } from "lucide-react";

import Container from "../components/Container";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";

import { useCartStore } from "../stores/cartStore";
import { useAuth } from "../context/AuthContext";

import {
  formatTZS,
  getPrimaryImageUrl,
  swapToPlaceholder,
} from "../utils/format";

const quantityButtonClass =
  "inline-flex h-11 w-11 items-center justify-center hover:bg-[color:var(--paper-deep)] disabled:cursor-not-allowed disabled:opacity-40";

function CartPage() {
  const { token, loading: authLoading } = useAuth();

  const { items, loading, loadCart, removeItem, updateQuantity, getTotal } =
    useCartStore();

  useEffect(() => {
    if (authLoading || !token) return;

    loadCart(token).catch((error) => {
      console.error("Failed to load cart:", error);
    });
  }, [token, authLoading, loadCart]);

  if (authLoading || loading) {
    return <Spinner label="Loading your cart…" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={
          <>
            Your cart is <em>empty</em>
          </>
        }
        message="You haven't added any products yet."
      >
        <Link to="/products" className="vero-btn">
          Continue shopping
        </Link>
      </EmptyState>
    );
  }

  const total = getTotal();

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="mb-12 border-b pb-8">
          <h1>
            Shopping <em>cart</em>
          </h1>

          <p className="mt-4 text-neutral-600">
            Review your products before checkout.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Items */}
          <ul className="divide-y border-b border-t lg:col-span-2">
            {items.map((item) => {
              const { product } = item;

              const variant = product.variants.find(
                (itemVariant) => itemVariant.id === item.variantId,
              );

              const variantStock = variant ? Number(variant.stock) : 0;

              return (
                <li
                  key={`${product.id}-${item.variantId}`}
                  className="flex gap-5 py-6"
                >
                  <div className="aspect-square w-24 shrink-0 overflow-hidden bg-neutral-100 sm:w-28">
                    <img
                      src={getPrimaryImageUrl(product.images)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={swapToPlaceholder}
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                    <div>
                      <Link
                        to={`/products/${product.id}`}
                        className="text-lg hover:underline"
                      >
                        {product.name}
                      </Link>

                      <p className="mt-2 text-sm text-neutral-600">
                        {item.variantName}: {item.variantValue}
                      </p>

                      <p className="text-xs text-neutral-500">
                        SKU: {item.variantSku}
                      </p>

                      <p className="mt-2 text-sm text-neutral-600">
                        {formatTZS(product.price)} per item
                      </p>

                      {variant && (
                        <p
                          className={`mt-1 text-xs ${
                            variantStock > 0
                              ? "text-neutral-500"
                              : "text-[color:var(--danger)]"
                          }`}
                        >
                          {variantStock > 0
                            ? `${variantStock} available`
                            : "Out of stock"}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex items-center border">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${product.name}`}
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              item.quantity - 1,
                              token ?? undefined,
                            )
                          }
                          disabled={item.quantity <= 1}
                          className={quantityButtonClass}
                        >
                          <Minus size={16} />
                        </button>

                        <span className="min-w-10 text-center text-sm">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase quantity of ${product.name}`}
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              item.quantity + 1,
                              token ?? undefined,
                            )
                          }
                          disabled={variant ? item.quantity >= variantStock : false}
                          className={quantityButtonClass}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.variantId, token ?? undefined)
                        }
                        className="inline-flex items-center gap-2 text-sm text-[color:var(--danger)] underline underline-offset-4"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Summary */}
          <aside className="h-fit border bg-white p-6 sm:p-8">
            <h2>Order summary</h2>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Items</dt>
                <dd>{itemCount}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd>{formatTZS(total)}</dd>
              </div>

              <div className="flex justify-between border-t pt-4 text-base">
                <dt>Total</dt>
                <dd className="text-xl">{formatTZS(total)}</dd>
              </div>
            </dl>

            <Link to="/checkout" className="vero-btn mt-8 w-full">
              Proceed to checkout
            </Link>

            <Link
              to="/products"
              className="mt-4 block text-center text-sm text-neutral-600 underline underline-offset-4"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </Container>
    </section>
  );
}

export default CartPage;