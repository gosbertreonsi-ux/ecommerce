import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Package,
} from "lucide-react";

import Container from "../components/Container";
import Button from "../components/Button";

import {
  getMyOrders,
  type Order,
} from "../api/orders.api";

import {
  useAuth,
} from "../context/AuthContext";


function getProductImageUrl(
  imageUrl: string,
): string {
  if (
    imageUrl.startsWith(
      "http://",
    ) ||
    imageUrl.startsWith(
      "https://",
    )
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


function OrdersPage() {

  const navigate =
    useNavigate();

  const {
    token,
    loading: authLoading,
  } = useAuth();


  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  /*
   * ============================================================
   * LOAD ORDERS
   * ============================================================
   */

  useEffect(() => {

    if (authLoading) {
      return;
    }


    if (!token) {

      navigate("/login");

      return;

    }


    let cancelled = false;


    const loadOrders =
      async () => {

        try {

          setLoading(true);

          setError("");


          const response =
            await getMyOrders(
              token,
            );


          if (cancelled) {
            return;
          }


          setOrders(
            response.data,
          );

        } catch (err) {

          if (cancelled) {
            return;
          }


          console.error(
            "Failed to load orders:",
            err,
          );


          setError(
            err instanceof Error
              ? err.message
              : "Failed to load orders.",
          );

        } finally {

          if (!cancelled) {

            setLoading(false);

          }

        }

      };


    void loadOrders();


    return () => {

      cancelled = true;

    };

  }, [
    token,
    authLoading,
    navigate,
  ]);


  /*
   * ============================================================
   * AUTH LOADING
   * ============================================================
   */

  if (authLoading) {

    return (
      <section className="py-20">

        <Container>

          <div className="mx-auto max-w-lg text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />

            <h1 className="mt-6 text-2xl font-bold">
              Loading...
            </h1>

          </div>

        </Container>

      </section>
    );

  }


  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {

    return (
      <section className="py-20">

        <Container>

          <div className="mx-auto max-w-lg text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />

            <h1 className="mt-6 text-2xl font-bold">
              Loading your orders...
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Please wait.
            </p>

          </div>

        </Container>

      </section>
    );

  }


  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {

    return (
      <section className="py-20">

        <Container>

          <div className="mx-auto max-w-lg text-center">

            <h1 className="text-3xl font-bold">
              Something went wrong
            </h1>


            <p className="mt-3 text-neutral-600">
              {error}
            </p>


            <Button
              className="mt-6"
              onClick={() =>
                window.location.reload()
              }
            >
              Try again
            </Button>

          </div>

        </Container>

      </section>
    );

  }


  /*
   * ============================================================
   * EMPTY
   * ============================================================
   */

  if (orders.length === 0) {

    return (
      <section className="py-20">

        <Container>

          <div className="mx-auto max-w-lg text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">

              <Package
                size={30}
                className="text-neutral-400"
              />

            </div>


            <h1 className="mt-6 text-3xl font-bold">
              No orders yet
            </h1>


            <p className="mt-3 text-neutral-600">
              You haven't placed any orders
              yet.
            </p>


            <Link
              to="/products"
              className="mt-6 inline-block"
            >

              <Button>
                Start shopping
              </Button>

            </Link>

          </div>

        </Container>

      </section>
    );

  }


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <section className="py-12 sm:py-16">

      <Container>

        <div className="mx-auto max-w-5xl">


          {/* HEADER */}

          <div>

            <h1 className="text-3xl font-bold">
              My Orders
            </h1>


            <p className="mt-2 text-neutral-600">
              View and track your orders.
            </p>

          </div>


          {/* ORDERS */}

          <div className="mt-10 space-y-4">

            {orders.map(
              (order) => {

                const total =
                  Number(
                    order.total,
                  );


                const itemCount =
                  order.items?.reduce(
                    (
                      count,
                      item,
                    ) =>
                      count +
                      item.quantity,
                    0,
                  ) ?? 0;


                /*
                 * ------------------------------------------------
                 * PRODUCT IMAGE
                 * ------------------------------------------------
                 */

                const firstItem =
                  order.items?.[0];

                const primaryImage =
                  firstItem?.product
                    ?.images
                    ?.find(
                      (image) =>
                        image.isPrimary,
                    )
                    ?.imageUrl;


                const firstImage =
                  firstItem?.product
                    ?.images?.[0]
                    ?.imageUrl;


                const imagePath =
                  primaryImage ??
                  firstImage;


                const imageUrl =
                  imagePath
                    ? getProductImageUrl(
                        imagePath,
                      )
                    : null;


                return (

                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm"
                  >

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">


                      {/* ORDER INFO */}

                      <div className="flex min-w-0 gap-4">


                        {/* PRODUCT IMAGE */}

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">

                          {imageUrl ? (

                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                firstItem
                                  ?.product
                                  ?.name ||
                                "Order product"
                              }
                              className="h-full w-full object-cover"
                              onError={(
                                event,
                              ) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />

                          ) : (

                            <Package
                              size={22}
                              className="text-neutral-400"
                            />

                          )}

                        </div>


                        {/* DETAILS */}

                        <div className="min-w-0">

                          <p className="font-semibold">

                            #
                            {
                              order.orderNumber
                            }

                          </p>


                          {order.createdAt && (

                            <p className="mt-1 text-sm text-neutral-500">

                              {new Date(
                                order.createdAt,
                              ).toLocaleDateString()}

                            </p>

                          )}


                          <p className="mt-1 text-sm text-neutral-500">

                            {itemCount}{" "}
                            {itemCount === 1
                              ? "item"
                              : "items"}

                          </p>


                          {firstItem?.product
                            ?.name && (

                            <p className="mt-1 truncate text-sm font-medium text-neutral-700">

                              {
                                firstItem
                                  .product
                                  .name
                              }

                              {itemCount >
                                1 &&
                                " + more"}

                            </p>

                          )}

                        </div>

                      </div>


                      {/* RIGHT */}

                      <div className="flex items-center justify-between gap-6 sm:justify-end">


                        <div className="text-left sm:text-right">

                          <p className="text-lg font-bold">

                            TZS{" "}
                            {total.toLocaleString()}

                          </p>


                          <span className="mt-1 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize">

                            {
                              order.status
                            }

                          </span>

                        </div>


                        <ArrowRight
                          size={20}
                          className="text-neutral-400"
                        />

                      </div>

                    </div>

                  </Link>

                );

              },
            )}

          </div>

        </div>

      </Container>

    </section>
  );
}


export default OrdersPage;