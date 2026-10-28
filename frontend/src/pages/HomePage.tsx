import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import Container from "../components/Container";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/products.api";
import type { Product } from "../types/product";
import {
  formatTZS,
  getPrimaryImageUrl,
  pickImage,
  swapToPlaceholder,
} from "../utils/format";

/** Editorial merchandising reads the EXISTING product API. No sample/fake products. */
function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        console.error("Unable to load homepage products:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProducts();
    return () => { cancelled = true; };
  }, []);

  const featured = useMemo(() => {
    const prioritized = [
      ...products.filter((product) => product.isFeatured),
      ...products.filter((product) => !product.isFeatured),
    ];
    return prioritized.slice(0, 4);
  }, [products]);

  // Prefer a genuine merchandise photograph for the hero; keep a tasteful
  // branded fallback when there are no images or the API is unavailable.
  const heroProduct = useMemo(
    () =>
      products.find((product) => product.isFeatured && product.images.length > 0) ??
      products.find((product) => product.images.length > 0),
    [products],
  );

  const categories = useMemo(
    () => products.filter((product, index, all) =>
      all.findIndex((item) => item.category.slug === product.category.slug) === index,
    ).slice(0, 3),
    [products],
  );

  return (
    <>
      <Loader />

      <section className="esh-hero" aria-labelledby="home-heading">
        <div className="esh-hero__copy">
          <div className="esh-eyebrow"><span className="esh-eyebrow__line" /> THE E-SHOP EDIT</div>
          <h1 id="home-heading" className="esh-hero__title">
            Discover the <em>art</em> of everyday.
          </h1>
          <p className="esh-hero__description">
            A considered collection of goods for the spaces you shape,
            the moments you make, and everything in between.
          </p>
          <div className="esh-hero__actions">
            <Link to="/products" className="esh-action esh-action--dark">
              Explore the collection <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <a href="#our-story" className="esh-text-link">Our point of view <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
          <div className="esh-hero__index" aria-hidden="true">
            <span>EST. FOR THE EVERYDAY</span><span>01 / THE COLLECTION</span>
          </div>
        </div>

        <div className="esh-hero__visual">
          {heroProduct ? (
            <Link to={"/products/" + heroProduct.id} className="esh-hero__image-link" aria-label={"Explore " + heroProduct.name}>
              <img
                className="esh-hero__image"
                src={getPrimaryImageUrl(heroProduct.images)}
                alt={pickImage(heroProduct.images)?.altText || heroProduct.name}
                onError={swapToPlaceholder}
                fetchPriority="high"
              />
              {/* OPTIONAL HERO VIDEO — OFF BY DEFAULT.
                  1. Put your silent short MP4 at frontend/public/videos/hero.mp4.
                  2. Remove ONLY the JSX comment markers around <video> below.
                  3. Leave the <img> above in place as a cover / fallback.
                  The video uses the very same cover area and object-fit: cover.
              */}
              {
              <video
                className="esh-hero__video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                onError={(event) => { event.currentTarget.style.display = "none"; }}
              >
                <source src="../../public/videos/hero.mp4" type="video/mp4" />
              </video>
          }
              <div className="esh-hero__image-caption">
                <span><small>IN THE SPOTLIGHT</small><strong>{heroProduct.name}</strong></span>
                <span>{formatTZS(heroProduct.price)} <ArrowUpRight size={17} aria-hidden="true" /></span>
              </div>
            </Link>
          ) : (
            <div className="esh-hero__visual-fallback" aria-hidden="true">
              <span className="esh-hero__visual-mark">E.</span>
              <span className="esh-hero__visual-subtitle">A thoughtful way to shop</span>
            </div>
          )}
          <span className="esh-hero__side-label" aria-hidden="true">GOOD THINGS, BEAUTIFULLY FOUND</span>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="esh-section esh-categories" aria-labelledby="categories-heading">
          <Container>
            <div className="esh-section-heading">
              <div>
                <p className="esh-kicker">01 — EXPLORE</p>
                <h2 id="categories-heading" className="esh-section-title">Find your <em>favourites.</em></h2>
              </div>
              <Link to="/products" className="esh-text-link">Shop everything <ArrowUpRight size={17} aria-hidden="true" /></Link>
            </div>
            <div className="esh-category-grid">
              {categories.map((product, index) => (
                <Link
                  key={product.category.id}
                  className="esh-category-card"
                  to={"/products?category=" + encodeURIComponent(product.category.slug)}
                >
                  <div className="esh-category-card__photo">
                    {product.images.length > 0 ? (
                      <img
                        src={getPrimaryImageUrl(product.images)}
                        alt={pickImage(product.images)?.altText || product.name}
                        loading="lazy"
                        onError={swapToPlaceholder}
                      />
                    ) : <span className="esh-category-card__initial" aria-hidden="true">{product.category.name.charAt(0)}</span>}
                    <span className="esh-category-card__number">0{index + 1}</span>
                  </div>
                  <div className="esh-category-card__bottom">
                    <h3>{product.category.name}</h3>
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section id="our-story" className="esh-story" aria-labelledby="story-heading">
        <Container className="esh-story__inner">
          <div className="esh-story__seal" aria-hidden="true"><span>E</span><small>THE EVERYDAY EDIT</small></div>
          <div className="esh-story__text">
            <p className="esh-kicker">OUR PHILOSOPHY</p>
            <h2 id="story-heading">Beautiful things. <em>Simple pleasures.</em></h2>
            <p>Shopping should feel inspiring, never complicated. Find what speaks to you, explore the details, and make it yours.</p>
            <Link to="/products" className="esh-text-link">Discover the edit <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </Container>
      </section>

      <section className="esh-section esh-featured" aria-labelledby="featured-heading">
        <Container>
          <div className="esh-section-heading">
            <div>
              <p className="esh-kicker">02 — THE SELECTION</p>
              <h2 id="featured-heading" className="esh-section-title">Selected for <em>you.</em></h2>
            </div>
            <Link to="/products" className="esh-text-link">View all products <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          {featured.length > 0 ? (
            <div className="esh-featured-grid">
              {featured.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="esh-featured-empty" role="status">
              <p>{loading ? "Finding the collection…" : error ? "Our products cannot be loaded right now." : "Our collection is being prepared."}</p>
              <Link to="/products" className="esh-text-link">Browse the shop <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          )}
        </Container>
      </section>

      <section className="esh-final-note" aria-labelledby="final-heading">
        <Container className="esh-final-note__inner">
          <p className="esh-kicker">A LITTLE SOMETHING FOR EVERYONE</p>
          <h2 id="final-heading">Make room for <em>more.</em></h2>
          <Link to="/products" className="esh-action esh-action--light">
            Shop all products <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </Container>
      </section>
    </>
  );
}

export default HomePage;
