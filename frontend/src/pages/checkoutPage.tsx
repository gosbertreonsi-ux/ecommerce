import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";

import { Link, useNavigate } from "react-router-dom";

import { Banknote, Check, CreditCard, Plus, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Container from "../components/Container";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";

import { useCartStore } from "../stores/cartStore";

import { getAddresses, createAddress } from "../api/addresses.api";
import type { Address } from "../api/addresses.api";

import { createOrder } from "../api/orders.api";
import type { PaymentMethod } from "../api/orders.api";

import { useAuth } from "../context/AuthContext";

import {
  formatTZS,
  getPrimaryImageUrl,
  swapToPlaceholder,
} from "../utils/format";

const EMPTY_ADDRESS = {
  label: "Home",
  street: "",
  city: "",
  region: "",
  postalCode: "",
  country: "Tanzania",
};

type AddressForm = typeof EMPTY_ADDRESS;

const ADDRESS_FIELDS: {
  name: keyof AddressForm;
  label: string;
  required?: boolean;
  autoComplete: string;
}[] = [
  { name: "label", label: "Label", autoComplete: "off" },
  { name: "street", label: "Street", required: true, autoComplete: "address-line1" },
  { name: "city", label: "City", required: true, autoComplete: "address-level2" },
  { name: "region", label: "Region", required: true, autoComplete: "address-level1" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code" },
  { name: "country", label: "Country", required: true, autoComplete: "country-name" },
];

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    value: "CASH",
    label: "Cash on delivery",
    description: "Pay when your order arrives",
    icon: Banknote,
  },
  {
    value: "CARD",
    label: "Card",
    description: "Pay securely with a card",
    icon: CreditCard,
  },
  {
    value: "MOBILE_MONEY",
    label: "Mobile money",
    description: "Pay using mobile money",
    icon: Smartphone,
  },
];

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

/** A selectable card. `border-black` wins over the base border colour from vero.css. */
function OptionButton({ selected, onClick, children }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-start justify-between gap-4 border p-5 text-left ${
        selected ? "border-black bg-gray-50" : ""
      }`}
    >
      {children}

      {selected && <Check size={18} aria-hidden="true" className="mt-1 shrink-0" />}
    </button>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();

  const { token, loading: authLoading } = useAuth();

  const items = useCartStore((state) => state.items);
  const cartLoading = useCartStore((state) => state.loading);
  const loadCart = useCartStore((state) => state.loadCart);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressForm>(EMPTY_ADDRESS);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // Load cart
  useEffect(() => {
    if (authLoading || !token) return;

    let cancelled = false;

    const loadUserCart = async () => {
      try {
        setError("");

        await loadCart(token);
      } catch (err) {
        if (cancelled) return;

        console.error("CHECKOUT: Cart loading failed:", err);

        setError(err instanceof Error ? err.message : "Failed to load cart");
      }
    };

    void loadUserCart();

    return () => {
      cancelled = true;
    };
  }, [token, authLoading, loadCart]);

  // Load addresses, then select the default one (or the first)
  useEffect(() => {
    if (authLoading || !token) return;

    let cancelled = false;

    const loadUserAddresses = async () => {
      try {
        setLoadingAddresses(true);

        const result = await getAddresses(token);

        if (cancelled) return;

        const loaded = Array.isArray(result) ? result : [];

        setAddresses(loaded);

        const addressToSelect =
          loaded.find((address) => address.isDefault) ?? loaded[0];

        if (addressToSelect) {
          setSelectedAddressId(addressToSelect.id);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("CHECKOUT: Address loading failed:", err);

        setError(err instanceof Error ? err.message : "Failed to load addresses");
      } finally {
        if (!cancelled) setLoadingAddresses(false);
      }
    };

    void loadUserAddresses();

    return () => {
      cancelled = true;
    };
  }, [token, authLoading]);

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setAddressForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) return;

    try {
      setSavingAddress(true);
      setError("");

      const newAddress = await createAddress(token, addressForm);

      setAddresses((current) => [...current, newAddress]);
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      setAddressForm(EMPTY_ADDRESS);
    } catch (err) {
      console.error("CHECKOUT: Address creation failed:", err);

      setError(err instanceof Error ? err.message : "Failed to create address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!token) {
      setError("Please sign in before placing your order.");
      return;
    }

    if (!selectedAddressId) {
      setError("Select a delivery address.");
      return;
    }

    if (!paymentMethod) {
      setError("Select a payment method.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      const result = await createOrder(
        token,
        selectedAddressId,
        items,
        paymentMethod,
      );

      // Clear backend + Zustand cart
      await clearCart(token);

      navigate(`/orders/${result.data.id}`);
    } catch (err) {
      console.error("CHECKOUT: Order creation failed:", err);

      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading) {
    return <Spinner label="Checking your session…" />;
  }

  if (!token) {
    return (
      <EmptyState
        title={
          <>
            Sign in to <em>continue</em>
          </>
        }
        message="You need an account to check out."
      >
        <Link to="/login" className="vero-btn">
          Sign in
        </Link>
      </EmptyState>
    );
  }

  if (cartLoading) {
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
        message="Add some products before checking out."
      >
        <Link to="/products" className="vero-btn">
          Continue shopping
        </Link>
      </EmptyState>
    );
  }

  const total = getTotal();

  const selectedPayment = PAYMENT_OPTIONS.find(
    (option) => option.value === paymentMethod,
  );

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b pb-8">
          <div>
            <h1>
              Complete your <em>order</em>
            </h1>

            <p className="mt-4 text-neutral-600">
              Choose where it goes and how you'll pay.
            </p>
          </div>

          <Link
            to="/cart"
            className="text-sm text-neutral-600 underline underline-offset-4 hover:text-black"
          >
            Back to cart
          </Link>
        </div>

        {error && (
          <div className="vero-error mb-8" role="alert">
            {error}
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Delivery address */}
            <section className="border bg-white p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2>Delivery address</h2>

                <button
                  type="button"
                  onClick={() => setShowAddressForm((value) => !value)}
                  aria-expanded={showAddressForm}
                  className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
                >
                  <Plus size={16} aria-hidden="true" />
                  Add address
                </button>
              </div>

              {loadingAddresses && (
                <p className="text-sm text-neutral-500">Loading addresses…</p>
              )}

              {!loadingAddresses && addresses.length === 0 && (
                <p className="border border-dashed p-6 text-center text-neutral-600">
                  You don't have a delivery address yet.
                </p>
              )}

              {!loadingAddresses && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <OptionButton
                      key={address.id}
                      selected={selectedAddressId === address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <div>
                        <p>
                          {address.label}

                          {address.isDefault && (
                            <span className="ml-2 rounded-full border px-2 py-0.5 text-xs text-neutral-600">
                              Default
                            </span>
                          )}
                        </p>

                        <p className="mt-2 text-sm text-neutral-600">
                          {address.street}, {address.city}
                        </p>

                        <p className="text-sm text-neutral-600">
                          {address.region}, {address.country}
                        </p>

                        {address.postalCode && (
                          <p className="text-sm text-neutral-600">
                            {address.postalCode}
                          </p>
                        )}
                      </div>
                    </OptionButton>
                  ))}
                </div>
              )}

              {showAddressForm && (
                <form
                  onSubmit={handleCreateAddress}
                  className="mt-8 border-t pt-8"
                >
                  <h3 className="mb-6 text-xl">New address</h3>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                    {ADDRESS_FIELDS.map((field) => (
                      <div key={field.name}>
                        <label
                          htmlFor={`address-${field.name}`}
                          className="vero-label"
                        >
                          {field.label}
                        </label>

                        <input
                          id={`address-${field.name}`}
                          name={field.name}
                          value={addressForm[field.name]}
                          onChange={handleAddressChange}
                          required={field.required}
                          autoComplete={field.autoComplete}
                          className="vero-input"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="vero-btn"
                    >
                      {savingAddress ? "Saving…" : "Save address"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="vero-btn vero-btn--ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Payment method */}
            <section className="border bg-white p-6 sm:p-8">
              <h2 className="mb-6">Payment method</h2>

              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;

                  return (
                    <OptionButton
                      key={option.value}
                      selected={paymentMethod === option.value}
                      onClick={() => setPaymentMethod(option.value)}
                    >
                      <div className="flex items-center gap-4">
                        <Icon size={22} aria-hidden="true" className="shrink-0" />

                        <div>
                          <p>{option.label}</p>

                          <p className="mt-1 text-sm text-neutral-500">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </OptionButton>
                  );
                })}
              </div>
            </section>

            {/* Products */}
            <section className="border bg-white p-6 sm:p-8">
              <h2 className="mb-6">Your products</h2>

              <ul className="divide-y">
                {items.map((item) => {
                  const price = Number(item.product.price) || 0;

                  return (
                    <li
                      key={`${item.product.id}-${item.variantId}`}
                      className="flex gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="aspect-square w-20 shrink-0 overflow-hidden border">
                        <img
                          src={getPrimaryImageUrl(item.product.images)}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                          onError={swapToPlaceholder}
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg">{item.product.name}</h3>

                        <p className="mt-1 text-sm text-neutral-500">
                          {item.variantName}: {item.variantValue}
                        </p>

                        <p className="mt-1 text-sm text-neutral-500">
                          Quantity: {item.quantity}
                        </p>

                        <p className="mt-1 text-sm text-neutral-500">
                          {formatTZS(price)} each
                        </p>
                      </div>

                      <p className="text-right">{formatTZS(price * item.quantity)}</p>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* Summary */}
          <aside>
            <div className="sticky top-6 border bg-white p-6 sm:p-8">
              <h2 className="mb-6">Order summary</h2>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Products</dt>
                  <dd>{items.length}</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-neutral-600">Subtotal</dt>
                  <dd>{formatTZS(total)}</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-neutral-600">Delivery</dt>
                  <dd>Free</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-neutral-600">Payment</dt>
                  <dd>{selectedPayment?.label}</dd>
                </div>
              </dl>

              <div className="my-6 flex justify-between border-t pt-6 text-lg">
                <span>Total</span>
                <span>{formatTZS(total)}</span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddressId || items.length === 0}
                className="vero-btn w-full"
                aria-busy={placingOrder}
              >
                {placingOrder ? "Placing order…" : "Place order"}
              </button>

              <p className="mt-4 text-center text-xs text-neutral-500">
                By placing your order, you agree to our terms and conditions.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}

export default CheckoutPage;