import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Check,
  CreditCard,
  MapPin,
  Plus,
  Smartphone,
} from "lucide-react";

import { useCartStore } from "../stores/cartStore";

import {
  getAddresses,
  createAddress,
} from "../api/addresses.api";

import type {
  Address,
} from "../api/addresses.api";

import {
  createOrder,
} from "../api/orders.api";

import type {
  PaymentMethod,
} from "../api/orders.api";

import {
  useAuth,
} from "../context/AuthContext";


/*
|--------------------------------------------------------------------------
| PRODUCT IMAGE URL
|--------------------------------------------------------------------------
*/

const getProductImageUrl = (
  imageUrl: string,
): string => {
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
};


/*
|--------------------------------------------------------------------------
| CHECKOUT PAGE
|--------------------------------------------------------------------------
*/

const CheckoutPage = () => {

  const navigate =
    useNavigate();


  /*
  |--------------------------------------------------------------------------
  | AUTH
  |--------------------------------------------------------------------------
  */

  const {
    token,
    loading: authLoading,
  } = useAuth();


  /*
  |--------------------------------------------------------------------------
  | CART STORE
  |--------------------------------------------------------------------------
  */

  const items =
    useCartStore(
      (state) =>
        state.items,
    );

  const cartLoading =
    useCartStore(
      (state) =>
        state.loading,
    );

  const loadCart =
    useCartStore(
      (state) =>
        state.loadCart,
    );

  const getTotal =
    useCartStore(
      (state) =>
        state.getTotal,
    );

  const clearCart =
    useCartStore(
      (state) =>
        state.clearCart,
    );


  /*
  |--------------------------------------------------------------------------
  | ADDRESS STATE
  |--------------------------------------------------------------------------
  */

  const [
    addresses,
    setAddresses,
  ] =
    useState<Address[]>([]);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    loadingAddresses,
    setLoadingAddresses,
  ] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | PAYMENT STATE
  |--------------------------------------------------------------------------
  */

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      "CASH",
    );


  /*
  |--------------------------------------------------------------------------
  | NEW ADDRESS FORM
  |--------------------------------------------------------------------------
  */

  const [
    showAddressForm,
    setShowAddressForm,
  ] =
    useState(false);

  const [
    savingAddress,
    setSavingAddress,
  ] =
    useState(false);

  const [
    addressForm,
    setAddressForm,
  ] =
    useState({
      label: "Home",
      street: "",
      city: "",
      region: "",
      postalCode: "",
      country: "Tanzania",
    });


  /*
  |--------------------------------------------------------------------------
  | ORDER STATE
  |--------------------------------------------------------------------------
  */

  const [
    placingOrder,
    setPlacingOrder,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | LOAD CART
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (authLoading) {
      return;
    }

    if (!token) {
      return;
    }

    let cancelled = false;


    const loadUserCart =
      async () => {

        try {

          setError("");

          console.log(
            "CHECKOUT: Loading cart...",
          );

          await loadCart(token);

          if (cancelled) {
            return;
          }

          console.log(
            "CHECKOUT: Cart loaded.",
          );

        } catch (err) {

          if (cancelled) {
            return;
          }

          console.error(
            "CHECKOUT: Cart loading failed:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load cart",
          );
        }
      };


    loadUserCart();


    return () => {
      cancelled = true;
    };

  }, [
    token,
    authLoading,
    loadCart,
  ]);


  /*
  |--------------------------------------------------------------------------
  | LOAD ADDRESSES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (authLoading) {
      return;
    }

    if (!token) {
      return;
    }

    let cancelled = false;


    const loadUserAddresses =
      async () => {

        try {

          setLoadingAddresses(
            true,
          );

          console.log(
            "CHECKOUT: Loading addresses...",
          );


          const result =
            await getAddresses(
              token,
            );


          if (cancelled) {
            return;
          }


          const loadedAddresses =
            Array.isArray(result)
              ? result
              : [];


          console.log(
            "CHECKOUT: Addresses received:",
            loadedAddresses,
          );


          setAddresses(
            loadedAddresses,
          );


          /*
           * Automatically select:
           *
           * 1. Default address
           * 2. Otherwise first address
           */

          const defaultAddress =
            loadedAddresses.find(
              (address) =>
                address.isDefault,
            );


          const firstAddress =
            loadedAddresses[0];


          const addressToSelect =
            defaultAddress ||
            firstAddress;


          if (
            addressToSelect
          ) {

            setSelectedAddressId(
              addressToSelect.id,
            );
          }

        } catch (err) {

          if (cancelled) {
            return;
          }

          console.error(
            "CHECKOUT: Address loading failed:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load addresses",
          );

        } finally {

          if (!cancelled) {

            setLoadingAddresses(
              false,
            );
          }
        }
      };


    loadUserAddresses();


    return () => {
      cancelled = true;
    };

  }, [
    token,
    authLoading,
  ]);


  /*
  |--------------------------------------------------------------------------
  | HANDLE ADDRESS INPUT
  |--------------------------------------------------------------------------
  */

  const handleAddressChange =
    (
      event:
        React.ChangeEvent<HTMLInputElement>,
    ) => {

      const {
        name,
        value,
      } = event.target;


      setAddressForm(
        (current) => ({
          ...current,
          [name]: value,
        }),
      );
    };


  /*
  |--------------------------------------------------------------------------
  | CREATE ADDRESS
  |--------------------------------------------------------------------------
  */

  const handleCreateAddress =
    async (
      event:
        React.FormEvent<HTMLFormElement>,
    ) => {

      event.preventDefault();


      if (!token) {
        return;
      }


      try {

        setSavingAddress(
          true,
        );

        setError("");


        const newAddress =
          await createAddress(
            token,
            {
              label:
                addressForm.label,

              street:
                addressForm.street,

              city:
                addressForm.city,

              region:
                addressForm.region,

              postalCode:
                addressForm.postalCode,

              country:
                addressForm.country,
            },
          );


        console.log(
          "CHECKOUT: New address:",
          newAddress,
        );


        setAddresses(
          (current) => [
            ...current,
            newAddress,
          ],
        );


        setSelectedAddressId(
          newAddress.id,
        );


        setShowAddressForm(
          false,
        );


        setAddressForm({
          label: "Home",
          street: "",
          city: "",
          region: "",
          postalCode: "",
          country: "Tanzania",
        });

      } catch (err) {

        console.error(
          "CHECKOUT: Address creation failed:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to create address",
        );

      } finally {

        setSavingAddress(
          false,
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | PLACE ORDER
  |--------------------------------------------------------------------------
  */

  const handlePlaceOrder =
    async () => {

      /*
       * Authentication
       */

      if (!token) {

        setError(
          "Please log in before placing your order.",
        );

        return;
      }


      /*
       * Address
       */

      if (
        !selectedAddressId
      ) {

        setError(
          "Please select a delivery address.",
        );

        return;
      }


      /*
       * Payment method
       */

      if (!paymentMethod) {

        setError(
          "Please select a payment method.",
        );

        return;
      }


      /*
       * Cart
       */

      if (
        items.length === 0
      ) {

        setError(
          "Your cart is empty.",
        );

        return;
      }


      try {

        setPlacingOrder(
          true,
        );

        setError("");


        console.log(
          "CHECKOUT: Creating order...",
        );

        console.log(
          "CHECKOUT: Payment method:",
          paymentMethod,
        );


        /*
         * Create order.
         */

        const result =
          await createOrder(
            token,
            selectedAddressId,
            items,
            paymentMethod,
          );


        console.log(
          "CHECKOUT: Order created:",
          result,
        );


        /*
         * Clear backend + Zustand cart.
         */

        await clearCart(
          token,
        );


        /*
         * Go to order details.
         */

        navigate(
          `/orders/${result.data.id}`,
        );

      } catch (err) {

        console.error(
          "CHECKOUT: Order creation failed:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to place order",
        );

      } finally {

        setPlacingOrder(
          false,
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | TOTAL
  |--------------------------------------------------------------------------
  */

  const total =
    getTotal();


  /*
  |--------------------------------------------------------------------------
  | AUTH LOADING
  |--------------------------------------------------------------------------
  */

  if (authLoading) {

    return (
      <div className="min-h-screen flex items-center justify-center">

        <p className="text-gray-600">
          Checking authentication...
        </p>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | LOGIN REQUIRED
  |--------------------------------------------------------------------------
  */

  if (!token) {

    return (
      <div className="min-h-screen flex items-center justify-center px-4">

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Login required
          </h1>

          <p className="mt-2 text-gray-600">
            Please log in to continue to checkout.
          </p>

          <Link
            to="/login"
            className="
              inline-block
              mt-6
              rounded-lg
              bg-black
              px-6
              py-3
              text-white
              hover:bg-gray-800
            "
          >
            Login
          </Link>

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | CART LOADING
  |--------------------------------------------------------------------------
  */

  if (cartLoading) {

    return (
      <div className="min-h-screen flex items-center justify-center">

        <div className="text-center">

          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-gray-200
              border-t-black
            "
          />

          <p className="mt-4 text-gray-600">
            Loading your cart...
          </p>

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | EMPTY CART
  |--------------------------------------------------------------------------
  */

  if (
    items.length === 0
  ) {

    return (
      <div className="min-h-screen flex items-center justify-center px-4">

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-600">
            Add some products before checking out.
          </p>

          <Link
            to="/products"
            className="
              inline-block
              mt-6
              rounded-lg
              bg-black
              px-6
              py-3
              text-white
              hover:bg-gray-800
            "
          >
            Continue Shopping
          </Link>

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | MAIN CHECKOUT PAGE
  |--------------------------------------------------------------------------
  */

  return (

    <div className="min-h-screen bg-gray-50">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="border-b bg-white">

        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-6
            sm:px-6
            lg:px-8
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-bold">
                Checkout
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Complete your order
              </p>

            </div>


            <Link
              to="/cart"
              className="
                text-sm
                font-medium
                text-gray-600
                hover:text-black
              "
            >
              Back to Cart
            </Link>

          </div>

        </div>

      </header>


      {/* =========================================================
          MAIN
      ========================================================= */}

      <main
        className="
          mx-auto
          max-w-7xl
          px-4
          py-8
          sm:px-6
          lg:px-8
        "
      >

        {/* ERROR */}

        {error && (

          <div
            className="
              mb-6
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>

        )}


        <div
          className="
            grid
            grid-cols-1
            gap-8
            lg:grid-cols-3
          "
        >

          {/* =====================================================
              LEFT SIDE
          ===================================================== */}

          <div
            className="
              space-y-6
              lg:col-span-2
            "
          >

            {/* ===================================================
                DELIVERY ADDRESS
            =================================================== */}

            <section
              className="
                rounded-xl
                border
                bg-white
                p-6
              "
            >

              <div
                className="
                  mb-5
                  flex
                  items-center
                  justify-between
                "
              >

                <div className="flex items-center gap-3">

                  <MapPin size={22} />

                  <h2 className="text-lg font-semibold">
                    Delivery Address
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setShowAddressForm(
                      (value) =>
                        !value,
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-black
                    hover:underline
                  "
                >

                  <Plus size={16} />

                  Add Address

                </button>

              </div>


              {/* ADDRESS LOADING */}

              {loadingAddresses && (

                <p className="text-sm text-gray-500">
                  Loading addresses...
                </p>

              )}


              {/* NO ADDRESS */}

              {!loadingAddresses &&
                addresses.length === 0 && (

                  <div
                    className="
                      rounded-lg
                      border
                      border-dashed
                      p-6
                      text-center
                    "
                  >

                    <p className="text-gray-500">
                      You don't have a delivery address yet.
                    </p>

                  </div>

                )}


              {/* ADDRESS LIST */}

              {!loadingAddresses &&
                addresses.length > 0 && (

                  <div className="space-y-3">

                    {addresses.map(
                      (address) => {

                        const selected =
                          selectedAddressId ===
                          address.id;


                        return (

                          <button
                            key={
                              address.id
                            }
                            type="button"
                            onClick={() =>
                              setSelectedAddressId(
                                address.id,
                              )
                            }
                            className={`
                              w-full
                              rounded-lg
                              border
                              p-4
                              text-left
                              transition
                              ${
                                selected
                                  ? "border-black bg-gray-50"
                                  : "border-gray-200 hover:border-gray-400"
                              }
                            `}
                          >

                            <div
                              className="
                                flex
                                items-start
                                justify-between
                              "
                            >

                              <div>

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                  "
                                >

                                  <span className="font-semibold">
                                    {
                                      address.label
                                    }
                                  </span>


                                  {address.isDefault && (

                                    <span
                                      className="
                                        rounded-full
                                        bg-gray-100
                                        px-2
                                        py-1
                                        text-xs
                                        text-gray-600
                                      "
                                    >
                                      Default
                                    </span>

                                  )}

                                </div>


                                <p
                                  className="
                                    mt-2
                                    text-sm
                                    text-gray-600
                                  "
                                >
                                  {
                                    address.street
                                  }
                                  ,{" "}
                                  {
                                    address.city
                                  }
                                </p>


                                <p
                                  className="
                                    text-sm
                                    text-gray-600
                                  "
                                >
                                  {
                                    address.region
                                  }
                                  ,{" "}
                                  {
                                    address.country
                                  }
                                </p>


                                {address.postalCode && (

                                  <p
                                    className="
                                      text-sm
                                      text-gray-600
                                    "
                                  >
                                    {
                                      address.postalCode
                                    }
                                  </p>

                                )}

                              </div>


                              {selected && (

                                <div
                                  className="
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-black
                                    text-white
                                  "
                                >

                                  <Check size={16} />

                                </div>

                              )}

                            </div>

                          </button>

                        );
                      },
                    )}

                  </div>

                )}


              {/* =================================================
                  NEW ADDRESS FORM
              ================================================= */}

              {showAddressForm && (

                <form
                  onSubmit={
                    handleCreateAddress
                  }
                  className="
                    mt-6
                    border-t
                    pt-6
                  "
                >

                  <h3 className="mb-4 font-semibold">
                    Add New Address
                  </h3>


                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-4
                      sm:grid-cols-2
                    "
                  >

                    <input
                      name="label"
                      value={
                        addressForm.label
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="Label"
                      className="
                        rounded-lg
                        border
                        px-4
                        py-3
                        outline-none
                        focus:border-black
                      "
                    />


                    <input
                      name="street"
                      value={
                        addressForm.street
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="Street"
                      required
                      className="
                        rounded-lg
                        border
                        px-4
                        py-3
                        outline-none
                        focus:border-black
                      "
                    />


                    <input
                      name="city"
                      value={
                        addressForm.city
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="City"
                      required
                      className="
                        rounded-lg
                        border
                        px-4
                        py-3
                        outline-none
                        focus:border-black
                      "
                    />


                    <input
                      name="region"
                      value={
                        addressForm.region
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="Region"
                      required
                      className="
                        rounded-lg
                        border
                        px-4
                        py-3
                        outline-none
                        focus:border-black
                      "
                    />


                    <input
                      name="postalCode"
                      value={
                        addressForm.postalCode
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="Postal Code"
                      className="
                        rounded-lg
                        border
                        px-4
                        py-3
                        outline-none
                        focus:border-black
                      "
                    />


                    <input
                      name="country"
                      value={
                        addressForm.country
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="Country"
                      required
                      className="
                        rounded-lg
                        border
                        px-4
                        py-3
                        outline-none
                        focus:border-black
                      "
                    />

                  </div>


                  <div
                    className="
                      mt-4
                      flex
                      gap-3
                    "
                  >

                    <button
                      type="submit"
                      disabled={
                        savingAddress
                      }
                      className="
                        rounded-lg
                        bg-black
                        px-5
                        py-3
                        text-sm
                        font-medium
                        text-white
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >

                      {savingAddress
                        ? "Saving..."
                        : "Save Address"}

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        setShowAddressForm(
                          false,
                        )
                      }
                      className="
                        rounded-lg
                        border
                        px-5
                        py-3
                        text-sm
                        font-medium
                      "
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              )}

            </section>


            {/* ===================================================
                PAYMENT METHOD
            =================================================== */}

            <section
              className="
                rounded-xl
                border
                bg-white
                p-6
              "
            >

              <h2
                className="
                  mb-5
                  text-lg
                  font-semibold
                "
              >
                Payment Method
              </h2>


              <div className="space-y-3">

                {/* CASH */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      "CASH",
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-lg
                    border
                    p-4
                    text-left
                    transition
                    ${
                      paymentMethod ===
                      "CASH"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }
                  `}
                >

                  <div className="flex items-center gap-4">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-100
                      "
                    >
                      <span className="text-lg">
                        💵
                      </span>
                    </div>


                    <div>

                      <p className="font-medium">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Pay when your order arrives
                      </p>

                    </div>

                  </div>


                  {paymentMethod ===
                    "CASH" && (

                    <div
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        bg-black
                        text-white
                      "
                    >
                      <Check size={16} />
                    </div>

                  )}

                </button>


                {/* CARD */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      "CARD",
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-lg
                    border
                    p-4
                    text-left
                    transition
                    ${
                      paymentMethod ===
                      "CARD"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }
                  `}
                >

                  <div className="flex items-center gap-4">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-100
                      "
                    >
                      <CreditCard size={20} />
                    </div>


                    <div>

                      <p className="font-medium">
                        Card
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Pay securely with a card
                      </p>

                    </div>

                  </div>


                  {paymentMethod ===
                    "CARD" && (

                    <div
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        bg-black
                        text-white
                      "
                    >
                      <Check size={16} />
                    </div>

                  )}

                </button>


                {/* MOBILE MONEY */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      "MOBILE_MONEY",
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-lg
                    border
                    p-4
                    text-left
                    transition
                    ${
                      paymentMethod ===
                      "MOBILE_MONEY"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }
                  `}
                >

                  <div className="flex items-center gap-4">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-100
                      "
                    >
                      <Smartphone size={20} />
                    </div>


                    <div>

                      <p className="font-medium">
                        Mobile Money
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Pay using mobile money
                      </p>

                    </div>

                  </div>


                  {paymentMethod ===
                    "MOBILE_MONEY" && (

                    <div
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        bg-black
                        text-white
                      "
                    >
                      <Check size={16} />
                    </div>

                  )}

                </button>

              </div>

            </section>


            {/* ===================================================
                ORDER ITEMS
            =================================================== */}

            <section
              className="
                rounded-xl
                border
                bg-white
                p-6
              "
            >

              <h2
                className="
                  mb-5
                  text-lg
                  font-semibold
                "
              >
                Your Products
              </h2>


              <div className="divide-y">

                {items.map(
                  (
                    item,
                    index,
                  ) => {

                    const imagePath =
                      item.product.images
                        ?.find(
                          (image) =>
                            image.isPrimary,
                        )
                        ?.imageUrl ??
                      item.product.images
                        ?.[0]
                        ?.imageUrl;


                    const image =
                      imagePath
                        ? getProductImageUrl(
                            imagePath,
                          )
                        : "https://placehold.co/200x200?text=No+Image";


                    const price =
                      Number(
                        item.product.price,
                      ) || 0;


                    const subtotal =
                      price *
                      item.quantity;


                    return (

                      <div
                        key={`${item.product.id}-${index}`}
                        className="
                          flex
                          gap-4
                          py-5
                        "
                      >

                        <img
                          src={image}
                          alt={
                            item.product.images
                              ?.find(
                                (
                                  productImage,
                                ) =>
                                  productImage.isPrimary,
                              )
                              ?.altText ||
                            item.product.name
                          }
                          className="
                            h-20
                            w-20
                            rounded-lg
                            border
                            object-cover
                          "
                          onError={(
                            event,
                          ) => {
                            event.currentTarget.src =
                              "https://placehold.co/200x200?text=No+Image";
                          }}
                        />


                        <div className="flex-1">

                          <h3 className="font-medium">
                            {
                              item.product.name
                            }
                          </h3>


                          <p
                            className="
                              mt-1
                              text-sm
                              text-gray-500
                            "
                          >
                            Quantity:{" "}
                            {
                              item.quantity
                            }
                          </p>


                          <p
                            className="
                              mt-1
                              text-sm
                              text-gray-500
                            "
                          >
                            TZS{" "}
                            {price.toLocaleString()}
                            {" "}each
                          </p>

                        </div>


                        <div
                          className="
                            text-right
                            font-semibold
                          "
                        >
                          TZS{" "}
                          {subtotal.toLocaleString()}
                        </div>

                      </div>

                    );
                  },
                )}

              </div>

            </section>

          </div>


          {/* =====================================================
              RIGHT SIDE - SUMMARY
          ===================================================== */}

          <aside>

            <div
              className="
                sticky
                top-6
                rounded-xl
                border
                bg-white
                p-6
              "
            >

              <h2
                className="
                  mb-6
                  text-lg
                  font-semibold
                "
              >
                Order Summary
              </h2>


              <div
                className="
                  space-y-3
                  text-sm
                "
              >

                <div
                  className="
                    flex
                    justify-between
                  "
                >

                  <span className="text-gray-600">
                    Products
                  </span>

                  <span>
                    {items.length}
                  </span>

                </div>


                <div
                  className="
                    flex
                    justify-between
                  "
                >

                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span>
                    TZS{" "}
                    {total.toLocaleString()}
                  </span>

                </div>


                <div
                  className="
                    flex
                    justify-between
                  "
                >

                  <span className="text-gray-600">
                    Delivery
                  </span>

                  <span>
                    Free
                  </span>

                </div>

              </div>


              {/* SELECTED PAYMENT */}

              <div
                className="
                  mt-5
                  rounded-lg
                  bg-gray-50
                  p-4
                "
              >

                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-gray-500
                  "
                >
                  Payment
                </p>


                <p className="mt-1 font-medium">

                  {paymentMethod ===
                    "CASH" &&
                    "Cash on Delivery"}

                  {paymentMethod ===
                    "CARD" &&
                    "Card"}

                  {paymentMethod ===
                    "MOBILE_MONEY" &&
                    "Mobile Money"}

                </p>

              </div>


              <div
                className="
                  my-6
                  border-t
                  pt-6
                "
              >

                <div
                  className="
                    flex
                    justify-between
                    text-lg
                    font-bold
                  "
                >

                  <span>
                    Total
                  </span>

                  <span>
                    TZS{" "}
                    {total.toLocaleString()}
                  </span>

                </div>

              </div>


              {/* PLACE ORDER */}

              <button
                type="button"
                onClick={
                  handlePlaceOrder
                }
                disabled={
                  placingOrder ||
                  !selectedAddressId ||
                  items.length === 0
                }
                className="
                  w-full
                  rounded-lg
                  bg-black
                  px-5
                  py-3
                  font-medium
                  text-white
                  transition
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {placingOrder
                  ? "Placing Order..."
                  : "Place Order"}

              </button>


              <p
                className="
                  mt-4
                  text-center
                  text-xs
                  text-gray-500
                "
              >
                By placing your order, you agree
                to our terms and conditions.
              </p>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
};


export default CheckoutPage;