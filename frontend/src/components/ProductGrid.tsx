import ProductCard from "./ProductCard";

import type { Product } from "../types/product";

interface ProductGridProps {
  products: Product[];
}

function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-neutral-600">
        No products available.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;