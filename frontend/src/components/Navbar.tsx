import { Link, NavLink } from "react-router-dom";
import { LogOut, Package, ShoppingCart, User } from "lucide-react";

import Container from "./Container";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "text-black underline underline-offset-8"
    : "text-neutral-600 hover:text-black hover:underline hover:underline-offset-8";

const iconLinkClass =
  "inline-flex h-11 w-11 items-center justify-center text-neutral-600 hover:text-black";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const signedInUser = isAuthenticated ? user : null;

  return (
    <nav className="border-b bg-white" aria-label="Main">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="serif-italic text-2xl">
          E-Shop
        </Link>

        <div className="flex items-center gap-6 text-sm md:gap-8">
          <NavLink
            to="/"
            end
            className={(state) => `hidden md:inline ${navLinkClass(state)}`}
          >
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>

          {signedInUser && (
            <NavLink
              to="/orders"
              className={(state) => `hidden md:inline ${navLinkClass(state)}`}
            >
              My orders
            </NavLink>
          )}

          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center">
          {signedInUser && (
            <span className="mr-3 hidden text-sm text-neutral-600 sm:block">
              Hi, {signedInUser.firstName}
            </span>
          )}

          {signedInUser && (
            <Link
              to="/orders"
              className={`${iconLinkClass} md:hidden`}
              aria-label="My orders"
              title="My orders"
            >
              <Package size={20} />
            </Link>
          )}

          <Link
            to="/cart"
            className={iconLinkClass}
            aria-label="Shopping cart"
            title="Shopping cart"
          >
            <ShoppingCart size={20} />
          </Link>

          {signedInUser ? (
            <button
              type="button"
              onClick={logout}
              className={iconLinkClass}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <Link
              to="/login"
              className={iconLinkClass}
              aria-label="Sign in"
              title="Sign in"
            >
              <User size={20} />
            </Link>
          )}
        </div>
      </Container>
    </nav>
  );
}

export default Navbar;