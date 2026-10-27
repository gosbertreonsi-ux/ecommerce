import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import Container from "../components/Container";
import ProductGrid from "../components/ProductGrid";
import Spinner from "../components/Spinner";

import { getProducts } from "../api/products.api";

import type { Product } from "../types/product";

function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const data = await getProducts();

        if (!cancelled) setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);

        if (!cancelled) setError("Unable to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  let content: ReactNode;

  if (loading) {
    content = <Spinner label="Loading products…" />;
  } else if (error) {
    content = (
      <div className="vero-error" role="alert">
        {error}
      </div>
    );
  } else {
    content = <ProductGrid products={products} />;
  }

  return (
    <section className="py-12 sm:py-20">
      <Container>
        <div className="mb-14 grid gap-6 border-b pb-10 md:grid-cols-2 md:items-end">
          <div>
            <p className="mb-4 text-sm text-neutral-500">Shop</p>

            <h1>
              All <em>Products</em>
            </h1>
          </div>

          <p className="max-w-md text-neutral-600 md:justify-self-end">
            Discover products selected for quality, usefulness, and everyday
            value.
          </p>
        </div>

        {content}
      </Container>
    </section>
  );
}

export default ProductPage;