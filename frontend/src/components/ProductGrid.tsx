import ProductCard from "./ProductCard";

import type { Product } from "../types/product";

interface ProductGridProps {
  products: Product[];
}

function ProductGrid({
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500">
          No products available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}

export default ProductGrid;