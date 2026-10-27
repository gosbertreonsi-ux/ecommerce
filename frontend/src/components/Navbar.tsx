import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  ShoppingCart,
  User,
  LogOut,
  Package,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";


function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();


  return (
    <nav className="border-b border-neutral-200 bg-white">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ======================================================
            LOGO
            ====================================================== */}

        <Link
          to="/"
          className="text-xl font-bold tracking-tight"
        >
          E-Shop
        </Link>


        {/* ======================================================
            MAIN NAVIGATION
            ====================================================== */}

        <div className="hidden items-center gap-8 md:flex">

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-black"
                : "text-neutral-600 hover:text-black"
            }
          >
            Home
          </NavLink>


          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-black"
                : "text-neutral-600 hover:text-black"
            }
          >
            Products
          </NavLink>


          {/* ==================================================
              CUSTOMER ORDERS
              ================================================== */}

          {isAuthenticated && user && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-2 font-semibold text-black"
                  : "flex items-center gap-2 text-neutral-600 hover:text-black"
              }
            >
              <Package size={17} />

              My Orders
            </NavLink>
          )}


          {/* ==================================================
              ADMIN
              ================================================== */}

          {user?.role === "ADMIN" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-black"
                  : "text-neutral-600 hover:text-black"
              }
            >
              Admin
            </NavLink>
          )}

        </div>


        {/* ======================================================
            RIGHT SIDE
            ====================================================== */}

        <div className="flex items-center gap-4">

          {isAuthenticated && user ? (

            <div className="flex items-center gap-4">

              {/* USER NAME */}

              <span className="hidden text-sm text-neutral-600 sm:block">
                Hi, {user.firstName}
              </span>


              {/* MY ORDERS MOBILE */}

              <Link
                to="/orders"
                className="text-neutral-600 hover:text-black md:hidden"
                aria-label="My orders"
                title="My orders"
              >
                <Package size={20} />
              </Link>


              {/* CART */}

              <Link
                to="/cart"
                className="text-neutral-600 hover:text-black"
                aria-label="Shopping cart"
                title="Shopping cart"
              >
                <ShoppingCart size={20} />
              </Link>


              {/* LOGOUT */}

              <button
                type="button"
                onClick={logout}
                className="text-neutral-600 hover:text-black"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={20} />
              </button>

            </div>

          ) : (

            <div className="flex items-center gap-4">

              {/* LOGIN */}

              <Link
                to="/login"
                className="text-neutral-600 hover:text-black"
                aria-label="Login"
                title="Login"
              >
                <User size={20} />
              </Link>


              {/* CART */}

              <Link
                to="/cart"
                className="text-neutral-600 hover:text-black"
                aria-label="Shopping cart"
                title="Shopping cart"
              >
                <ShoppingCart size={20} />
              </Link>

            </div>

          )}

        </div>

      </div>

    </nav>
  );
}


export default Navbar;