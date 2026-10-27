import { Link } from "react-router-dom";
import { Star } from "lucide-react";

import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

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

function ProductCard({
  product,
}: ProductCardProps) {
  const primaryImage =
    product.images.find(
      (item) => item.isPrimary,
    )?.imageUrl;

  const firstImage =
    product.images[0]?.imageUrl;

  const image =
    primaryImage ??
    firstImage ??
    "https://placehold.co/800x800?text=No+Image";

  const imageUrl =
    getProductImageUrl(image);

  const stock =
    product.variants.reduce(
      (total, variant) =>
        total + Number(variant.stock),
      0,
    );

  const isInStock =
    stock > 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">

      <Link
        to={`/products/${product.id}`}
      >
        <div className="aspect-square overflow-hidden bg-neutral-100">

          <img
            src={imageUrl}
            alt={
              product.images.find(
                (item) =>
                  item.isPrimary,
              )?.altText ||
              product.name
            }
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src =
                "https://placehold.co/800x800?text=No+Image";
            }}
          />

        </div>
      </Link>

      <div className="p-5">

        <p className="text-sm text-neutral-500">
          {product.category.name}
        </p>

        <Link
          to={`/products/${product.id}`}
        >
          <h2 className="mt-1 font-semibold hover:underline">
            {product.name}
          </h2>
        </Link>

        <div className="mt-2 flex items-center gap-1 text-sm">

          <Star
            size={16}
            fill="currentColor"
          />

          <span>
            —
          </span>

        </div>

        <p className="mt-3 text-lg font-bold">
          TZS{" "}
          {Number(
            product.price,
          ).toLocaleString()}
        </p>

        <p
          className={`mt-2 text-xs ${
            isInStock
              ? "text-neutral-500"
              : "text-red-500"
          }`}
        >
          {isInStock
            ? `${stock} items available`
            : "Out of stock"}
        </p>

      </div>

    </article>
  );
}

export default ProductCard;