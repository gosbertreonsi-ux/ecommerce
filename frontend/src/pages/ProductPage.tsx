import {
  useEffect,
  useState,
} from "react";

import Container from "../components/Container";
import ProductGrid from "../components/ProductGrid";

import {
  getProducts,
} from "../api/products.api";

import type {
  Product,
} from "../types/product";

function ProductPage() {
  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getProducts();

        setProducts(data);
      } catch (error) {
        console.error(
          "Failed to load products:",
          error,
        );

        setError(
          "Unable to load products.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <section className="py-12 sm:py-20">

      <Container>

        <div className="mb-14 grid gap-6 border-b pb-10 md:grid-cols-2 md:items-end">

          <div>
            <p className="mb-4 text-sm text-neutral-500">
              Shop
            </p>

            <h1>
              All <em>Products</em>
            </h1>
          </div>

          <p className="max-w-md text-neutral-600 md:justify-self-end">
            Discover products selected for
            quality, usefulness, and everyday value.
          </p>

        </div>

        {loading && (
          <div className="py-20 text-center">
            <p className="text-neutral-600">
              Loading products...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="vero-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-neutral-600">
                No products available.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          products.length > 0 && (
            <ProductGrid
              products={products}
            />
          )}

      </Container>

    </section>
  );
}

export default ProductPage;