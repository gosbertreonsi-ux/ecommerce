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
    <section className="py-12 sm:py-16">

      <Container>

        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Shop
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            All Products
          </h1>

          <p className="mt-3 max-w-2xl text-neutral-600">
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
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">
              {error}
            </p>
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