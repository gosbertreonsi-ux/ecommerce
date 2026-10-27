import { Link } from "react-router-dom";

import type { Product } from "../types/product";

import {
  formatTZS,
  getPrimaryImageUrl,
  pickImage,
  swapToPlaceholder,
} from "../utils/format";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const href = `/products/${product.id}`;

  const stock = product.variants.reduce(
    (total, variant) => total + Number(variant.stock),
    0,
  );

  const inStock = stock > 0;

  return (
    <article className="border bg-white">
      {/* The name below is the accessible link; this one is for pointer users. */}
      <Link to={href} tabIndex={-1} aria-hidden="true" className="block">
        <div className="aspect-square overflow-hidden bg-neutral-100">
          <img
            src={getPrimaryImageUrl(product.images)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            onError={swapToPlaceholder}
          />
        </div>
      </Link>

      <div className="p-5">
        <p className="text-sm text-neutral-500">{product.category.name}</p>

        <h2 className="mt-1 text-xl">
          <Link to={href} className="hover:underline">
            {product.name}
          </Link>
        </h2>

        <p className="mt-3">{formatTZS(product.price)}</p>

        <p
          className={`mt-1 text-sm ${
            inStock ? "text-neutral-500" : "text-[color:var(--danger)]"
          }`}
        >
          {inStock ? `${stock} items available` : "Out of stock"}
        </p>
      </div>
    </article>
  );
}

export default ProductCard;