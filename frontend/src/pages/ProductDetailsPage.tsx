import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";

import Button from "../components/Button";
import Container from "../components/Container";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import { getProduct } from "../api/products.api";
import type { Product, ProductImage, ProductVariant } from "../types/product";
import { useCartStore } from "../stores/cartStore";
import { useAuth } from "../context/AuthContext";
import {
  formatTZS,
  getProductImageUrl,
  IMAGE_PLACEHOLDER,
  swapToPlaceholder,
} from "../utils/format";

type Feedback = {
  type: "error" | "success";
  message: string;
};

const quantityButtonClass =
  "inline-flex h-11 w-11 items-center justify-center hover:bg-[color:var(--paper-deep)] disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Backward-compatible option-to-image association.
 * In Admin > Products, edit an image's Alt text to include the variant value:
 *   Variant value: Blue   -> Alt text: "Blue iPhone, front view"
 *   Variant value: 256 GB -> Alt text: "Phone 256 GB edition"
 * No new database columns or image upload endpoints are required.
 * When nothing matches, the primary cover remains the fallback.
 */
function findVariantImage(
  images: ProductImage[],
  variant: ProductVariant | undefined,
): ProductImage | undefined {
  const value = variant?.value.trim();
  if (!value) return undefined;

  // Match whole words rather than mistakenly matching "red" in "Redmi".
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "iu");

  return images.find((image) => pattern.test(image.altText ?? ""));
}

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(Number(id));
        if (cancelled) return;

        setProduct(data);
        const firstAvailable = data.variants.find(
          (variant) => Number(variant.stock) > 0,
        );
        setSelectedVariantId(firstAvailable?.id ?? data.variants[0]?.id ?? null);
        setSelectedImageId(null);
        setQuantity(1);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <Spinner label="Loading product…" />;
  }

  if (error || !product) {
    return (
      <EmptyState
        title={<>Product not <em>found</em></>}
        message={error || "The product could not be found."}
      >
        <Link to="/products" className="vero-btn vero-btn--ghost">
          Back to products
        </Link>
      </EmptyState>
    );
  }

  const images = [...product.images].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.id - b.id,
  );
  const primaryImage = images.find((image) => image.isPrimary) ?? images[0];
  const totalStock = product.variants.reduce(
    (total, variant) => total + Number(variant.stock),
    0,
  );
  const selectedVariant = product.variants.find(
    (variant) => variant.id === selectedVariantId,
  );
  const selectedStock = selectedVariant ? Number(selectedVariant.stock) : 0;
  const canPurchase = Boolean(selectedVariant) && selectedStock > 0;
  const variantImage = findVariantImage(images, selectedVariant);
  const displayedImage =
    images.find((image) => image.id === selectedImageId) ??
    variantImage ??
    primaryImage;

  // Clicking a color selects its variant AND promotes its matching photo
  // to the large cover. When there is no labelled photo for that variant,
  // fall back to the product's primary image instead of showing a wrong color.
  const handleVariantSelect = (variant: ProductVariant) => {
    const matchingImage = findVariantImage(images, variant);

    setSelectedVariantId(variant.id);
    setSelectedImageId(matchingImage?.id ?? primaryImage?.id ?? null);
    setQuantity(1);
    setFeedback(null);
  };

  // Clicking a thumbnail makes it the large cover AND highlights its color.
  // The image's Alt Text identifies its variant; longer variant names are
  // checked first (for example, "Sky Blue" before "Blue").
  const handleThumbnailSelect = (image: ProductImage) => {
    setSelectedImageId(image.id);

    const matchingVariant = [...product.variants]
      .sort((a, b) => b.value.trim().length - a.value.trim().length)
      .find((variant) => findVariantImage([image], variant) !== undefined);

    if (matchingVariant) {
      setSelectedVariantId(matchingVariant.id);
    }

    setQuantity(1);
    setFeedback(null);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    if (selectedStock <= 0) return;
    setQuantity((current) => Math.min(selectedStock, current + 1));
  };

  const getSelectionProblem = (): string | null => {
    if (!selectedVariant) return "Select a product option first.";
    if (selectedStock <= 0) return "This option is out of stock.";
    if (quantity > selectedStock) {
      return `Only ${selectedStock} items are available.`;
    }
    return null;
  };

  const handleAddToCart = async () => {
    if (!token) {
      setFeedback({
        type: "error",
        message: "Sign in to add products to your cart.",
      });
      return;
    }

    const problem = getSelectionProblem();
    if (problem || !selectedVariant) {
      setFeedback({
        type: "error",
        message: problem ?? "Select a product option first.",
      });
      return;
    }

    try {
      setAdding(true);
      setFeedback(null);
      await addItem(product, selectedVariant.id, token, quantity);
      setFeedback({
        type: "success",
        message: `${product.name} (${selectedVariant.name}: ${selectedVariant.value}) was added to your cart.`,
      });
    } catch (err) {
      console.error("ADD TO CART ERROR:", err);
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to add product to cart.",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    const problem = getSelectionProblem();
    if (problem || !selectedVariant) {
      setFeedback({
        type: "error",
        message: problem ?? "Select a product option first.",
      });
      return;
    }

    try {
      setBuying(true);
      setFeedback(null);
      await addItem(product, selectedVariant.id, token, quantity);
      navigate("/checkout");
    } catch (err) {
      console.error("BUY NOW ERROR:", err);
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to start purchase.",
      });
    } finally {
      setBuying(false);
    }
  };

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to products
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Product gallery. The chosen option takes priority unless the user
              explicitly clicks another thumbnail. */}
          <div>
            <div className="aspect-square overflow-hidden bg-neutral-100">
              <img
                key={displayedImage?.id ?? "placeholder"}
                src={displayedImage ? getProductImageUrl(displayedImage.imageUrl) : IMAGE_PLACEHOLDER}
                alt={displayedImage?.altText || product.name}
                className="esh-detail-main-image h-full w-full object-cover"
                onError={swapToPlaceholder}
              />
            </div>
            {images.length > 1 && (
              <div className="esh-detail-thumbnails" aria-label="Product image gallery">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    className="esh-detail-thumbnail"
                    aria-label={`View ${image.altText || product.name} image`}
                    aria-pressed={displayedImage?.id === image.id}
                    onClick={() => handleThumbnailSelect(image)}
                  >
                    <img
                      src={getProductImageUrl(image.imageUrl)}
                      alt=""
                      loading="lazy"
                      onError={swapToPlaceholder}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm text-neutral-500">{product.category.name}</p>
            <h1 className="vero-title mt-3">{product.name}</h1>
            <p className="mt-3 text-sm text-neutral-500">SKU: {selectedVariant?.sku ?? product.sku}</p>
            <p className="mt-6 text-3xl [font-family:var(--font-serif)]">
              {formatTZS(product.price)}
            </p>
            <p className="mt-6 max-w-prose leading-7 text-neutral-600">
              {product.description}
            </p>
            <p className="mt-6 text-sm">
              {selectedVariant
                ? selectedStock > 0
                  ? `${selectedStock} available — ${selectedVariant.value}`
                  : "Out of stock"
                : totalStock > 0
                  ? `${totalStock} items available`
                  : "Out of stock"}
            </p>

            {product.variants.length > 0 && (
              <fieldset className="mt-8">
                <legend className="text-lg [font-family:var(--font-serif)]">
                  Select an option
                </legend>
                <div className="mt-3 grid gap-3">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === selectedVariantId;
                    const variantStock = Number(variant.stock);
                    const isOutOfStock = variantStock <= 0;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={isOutOfStock}
                        aria-pressed={isSelected}
                        onClick={() => handleVariantSelect(variant)}
                        className={`flex items-center justify-between gap-4 border px-4 py-3 text-left ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : "bg-white hover:border-black hover:bg-neutral-50"
                        } ${isOutOfStock ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <span>
                          <span className="block">{variant.name}</span>
                          <span className={`block text-sm ${
                            isSelected ? "text-neutral-300" : "text-neutral-600"
                          }`}>
                            {variant.value}
                          </span>
                          <span className={`mt-1 block text-xs ${
                            isSelected ? "text-neutral-300" : "text-neutral-500"
                          }`}>
                            SKU: {variant.sku}
                          </span>
                        </span>
                        <span className="text-sm">
                          {isOutOfStock ? "Out of stock" : `${variantStock} available`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {selectedVariant && (
              <div className="mt-8">
                <p className="text-lg [font-family:var(--font-serif)]">Quantity</p>
                <div className="mt-3 inline-flex items-center border">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className={quantityButtonClass}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-12 text-center" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={increaseQuantity}
                    disabled={quantity >= selectedStock || selectedStock <= 0}
                    className={quantityButtonClass}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Maximum available: {selectedStock}
                </p>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                disabled={!canPurchase || adding || buying || !token}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} aria-hidden="true" />
                {adding ? "Adding…" : "Add to cart"}
              </Button>
              <Button
                variant="secondary"
                disabled={!canPurchase || adding || buying}
                onClick={handleBuyNow}
              >
                {buying ? "Processing…" : "Buy now"}
              </Button>
            </div>

            {!token && (
              <p className="mt-4 text-sm text-neutral-600">
                <Link to="/login" className="text-black underline underline-offset-4">
                  Sign in
                </Link>{" "}
                to add products to your cart.
              </p>
            )}
            {feedback?.type === "error" && (
              <div className="vero-error mt-6" role="alert">{feedback.message}</div>
            )}
            {feedback?.type === "success" && (
              <p className="mt-6 border-l-2 border-black py-2 pl-4 text-sm" role="status">
                {feedback.message}{" "}
                <Link to="/cart" className="underline underline-offset-4">View cart</Link>
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default ProductDetailsPage;
