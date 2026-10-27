import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import Container from "../components/Container";
import ProductGrid from "../components/ProductGrid";
import Spinner from "../components/Spinner";
import { getProducts } from "../api/products.api";
import type { Product } from "../types/product";

function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();

  const search = params.get("q") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "default";

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
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    products.forEach((product) => unique.set(product.category.slug, product.category.name));
    return Array.from(unique, ([slug, name]) => ({ slug, name }));
  }, [products]);

  const displayedProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = !category || product.category.slug === category;
      const matchesText = !query || [product.name, product.description, product.category.name, product.brand?.name || ""]
        .some((value) => value.toLocaleLowerCase().includes(query));
      return matchesCategory && matchesText;
    });
    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
    if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [products, category, search, sort]);

  const updateParam = (key: string, value: string) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: key === "q" });
  };

  let content: ReactNode;
  if (loading) {
    content = <Spinner label="Loading products…" />;
  } else if (error) {
    content = <div className="vero-error" role="alert">{error}</div>;
  } else if (displayedProducts.length === 0) {
    content = (
      <div className="esh-empty-products">
        <h2>No products found.</h2>
        <p>Try another search or explore all products.</p>
        <button type="button" className="esh-text-link" onClick={() => setParams(new URLSearchParams())}>Clear filters ↗</button>
      </div>
    );
  } else {
    content = <ProductGrid products={displayedProducts} />;
  }

  return (
    <section className="esh-shop-page">
      <Container>
        <div className="esh-shop-heading">
          <p className="esh-kicker">THE E-SHOP COLLECTION</p>
          <h1>Everyday, <em>beautifully considered.</em></h1>
          <p>Explore the collection. Find something that feels just right for you.</p>
        </div>

        <div className="esh-shop-toolbar" aria-label="Shop filters">
          <div className="esh-shop-search">
            <Search size={20} aria-hidden="true" />
            <input type="search" aria-label="Find products" placeholder="Find something special…" value={search} onChange={(event) => updateParam("q", event.target.value)} />
          </div>
          <div className="esh-shop-controls">
            <label className="esh-shop-select">
              <SlidersHorizontal size={17} aria-hidden="true" />
              <span className="esh-visually-hidden">Category</span>
              <select value={category} onChange={(event) => updateParam("category", event.target.value)} aria-label="Filter by category">
                <option value="">All categories</option>
                {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
            </label>
            <label className="esh-shop-select">
              <span className="esh-visually-hidden">Sort products</span>
              <select value={sort} onChange={(event) => updateParam("sort", event.target.value)} aria-label="Sort products">
                <option value="default">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>
        <p className="esh-shop-count" aria-live="polite">
          {loading ? "Loading the collection" : error ? "Collection unavailable" : displayedProducts.length + " product" + (displayedProducts.length === 1 ? "" : "s")}
        </p>
        {content}
      </Container>
    </section>
  );
}

export default ProductPage;
