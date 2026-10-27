import { Link } from "react-router-dom";

import Container from "../components/Container";
import Loader from "../components/Loader";

function HomePage() {
  return (
    <>
      <Loader />

      <section className="flex min-h-[85vh] items-center py-20 sm:py-28">
        <Container>
          <div className="max-w-5xl">
            <p className="mb-8 text-sm text-neutral-500">
              Welcome to E-Shop
            </p>

            <h1>
              Everything <em>you</em> need.
              <span className="block pl-[8vw]">
                All in <em>one</em> place.
              </span>
            </h1>
          </div>
        </Container>
      </section>

      <section className="border-t py-16 sm:py-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-2">
            <h2>
              A simple and <em>secure</em> way to shop.
            </h2>

            <div>
              <p className="max-w-md text-lg leading-8 text-neutral-600">
                Discover quality products, add them to your
                cart, and enjoy a simple and secure shopping
                experience.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/products" className="vero-btn">
                  Shop products
                </Link>

                <Link to="/login" className="vero-btn vero-btn--ghost">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export default HomePage;
