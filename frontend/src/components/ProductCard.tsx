import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "../types/product";
import {
  formatTZS,
  getPrimaryImageUrl,
  getProductImageUrl,
  swapToPlaceholder,
} from "../utils/format";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const href = `/products/${product.id}`;
  const [activeIndex, setActiveIndex] = useState(0);
  const stock = product.variants.reduce(
    (total, variant) => total + Number(variant.stock),
    0,
  );
  const inStock = stock > 0;

  // The admin's primary image is always the cover. All remaining uploaded
  // product images are browsable using the arrows in display order.
  const uploadedImages = [...product.images].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.id - b.id,
  );
  const primaryImage =
    uploadedImages.find((image) => image.isPrimary) ?? uploadedImages[0];
  const images = primaryImage
    ? [primaryImage, ...uploadedImages.filter((image) => image.id !== primaryImage.id)]
    : [];
  const hasGallery = images.length > 1;
  const safeIndex = activeIndex < images.length ? activeIndex : 0;
  const overlayImage = images[safeIndex === 0 ? 1 : safeIndex];

  const goToImage = (direction: -1 | 1) => {
    setActiveIndex((current) => {
      if (!hasGallery) return 0;
      return (current + direction + images.length) % images.length;
    });
  };

  return (
    <article className="esh-product-card">
      <div
        className="esh-product-card__image-wrap"
        onMouseEnter={() => {
          if (hasGallery) setActiveIndex(1);
        }}
        onMouseLeave={() => setActiveIndex(0)}
      >
        <Link
          to={href}
          tabIndex={-1}
          aria-hidden="true"
          className="esh-product-card__image-link"
        >
          <img
            className="esh-product-card__cover-image"
            src={getPrimaryImageUrl(images)}
            alt=""
            loading="lazy"
            onError={swapToPlaceholder}
          />
          {hasGallery && overlayImage && (
            <img
              key={overlayImage.id}
              className={`esh-product-card__hover-image${safeIndex !== 0 ? " is-visible" : ""}`}
              src={getProductImageUrl(overlayImage.imageUrl)}
              alt=""
              loading="lazy"
              onError={(event) => {
                // Never cover a working primary image with a broken alternate.
                event.currentTarget.style.opacity = "0";
              }}
            />
          )}
          {product.isFeatured && (
            <span className="esh-product-card__flag">FEATURED</span>
          )}
        </Link>

        {hasGallery && (
          <div className="esh-product-card__carousel-controls" aria-label={`Browse ${product.name} images`}>
            <button
              type="button"
              className="esh-product-card__carousel-arrow"
              onClick={() => goToImage(-1)}
              aria-label={`Previous image of ${product.name}`}
            >
              <ChevronLeft size={21} aria-hidden="true" />
            </button>
            <span className="esh-product-card__carousel-count" aria-live="polite">
              {safeIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              className="esh-product-card__carousel-arrow"
              onClick={() => goToImage(1)}
              aria-label={`Next image of ${product.name}`}
            >
              <ChevronRight size={21} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className="esh-product-card__content">
        <p className="esh-product-card__category">{product.category.name}</p>
        <div className="esh-product-card__title-row">
          <h2 className="vero-title-sm">
            <Link to={href}>{product.name}</Link>
          </h2>
          <ArrowUpRight size={19} aria-hidden="true" />
        </div>
        <p className="esh-product-card__price">{formatTZS(product.price)}</p>
        <p className={`esh-product-card__stock${inStock ? "" : " esh-product-card__stock--out"}`}>
          {inStock ? `${stock} available` : "Out of stock"}
        </p>
      </div>
    </article>
  );
}

export default ProductCard;
