import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "../types/product";
import { formatTZS, getPrimaryImageUrl, swapToPlaceholder } from "../utils/format";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const href = "/products/" + product.id;
  const stock = product.variants.reduce((total, variant) => total + Number(variant.stock), 0);
  const inStock = stock > 0;

  return (
    <article className="esh-product-card">
      <Link to={href} tabIndex={-1} aria-hidden="true" className="esh-product-card__image-link">
        <div className="esh-product-card__image-wrap">
          <img
            src={getPrimaryImageUrl(product.images)}
            alt=""
            loading="lazy"
            onError={swapToPlaceholder}
          />
          {product.isFeatured && <span className="esh-product-card__flag">FEATURED</span>}
        </div>
      </Link>
      <div className="esh-product-card__content">
        <p className="esh-product-card__category">{product.category.name}</p>
        <div className="esh-product-card__title-row">
          <h2 className="vero-title-sm"><Link to={href}>{product.name}</Link></h2>
          <ArrowUpRight size={19} aria-hidden="true" />
        </div>
        <p className="esh-product-card__price">{formatTZS(product.price)}</p>
        <p className={"esh-product-card__stock" + (inStock ? "" : " esh-product-card__stock--out")}>
          {inStock ? stock + " available" : "Out of stock"}
        </p>
      </div>
    </article>
  );
}

export default ProductCard;
