import { Link } from "react-router-dom";

import Container from "../components/Container";
import Button from "../components/Button";

function HomePage() {
  return (
    <section className="py-20 sm:py-28">

      <Container>

        <div className="max-w-3xl">

          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Welcome to E-Shop
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Everything you need.
            <span className="block text-neutral-500">
              All in one place.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            Discover quality products, add them to your
            cart, and enjoy a simple and secure shopping
            experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <Link to="/products">
              <Button>
                Shop products
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="secondary">
                Sign in
              </Button>
            </Link>

          </div>

        </div>

      </Container>

    </section>
  );
}

export default HomePage;