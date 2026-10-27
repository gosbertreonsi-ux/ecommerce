import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/admin/AdminLayout";

import AdminRoute from "../components/auth/AdminRoute";

import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductPage";
import LoginPage from "../pages/LoginPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import RegisterPage from "../pages/RegisterPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/checkoutPage";
import OrdersPage from "../pages/OrdersPage";
import OrderDetailsPage from "../pages/OrderDetailsPage";
import PaymentPage from "../pages/PaymentPage";

import DashboardPage from "../features/admin/dashboard/DashboardPage";
import AdminProductsPage from "../features/admin/products/AdminProductsPage";
import AdminCategoriesPage from "../features/admin/categories/AdminCategoriesPage";
import AdminBrandsPage from "../features/admin/brands/AdminBrandsPage";
import AdminInventoryPage from "../features/admin/inventory/AdminInventoryPage";
import AdminOrdersPage from "../features/admin/orders/AdminOrdersPage";
import AdminPaymentsPage from "../features/admin/payments/AdminPaymentsPage";
import AdminCustomersPage from "../features/admin/customers/AdminCustomersPage";
import AdminReviewsPage from "../features/admin/reviews/AdminReviewsPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================================== */}
        {/* CUSTOMER APPLICATION */}
        {/* ================================================== */}

        <Route element={<MainLayout />}>
          {/* HOME */}

          <Route
            path="/"
            element={<HomePage />}
          />

          {/* PRODUCTS */}

          <Route
            path="/products"
            element={<ProductsPage />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetailsPage />}
          />

          {/* CART */}

          <Route
            path="/cart"
            element={<CartPage />}
          />

          {/* CHECKOUT */}

          <Route
            path="/checkout"
            element={<CheckoutPage />}
          />

          {/* ORDERS */}

          <Route
            path="/orders"
            element={<OrdersPage />}
          />

          <Route
            path="/orders/:id"
            element={<OrderDetailsPage />}
          />

          {/* PAYMENT */}

          <Route
            path="/payment/:id"
            element={<PaymentPage />}
          />

          {/* AUTH */}

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />
        </Route>

        {/* ================================================== */}
        {/* ADMIN APPLICATION */}
        {/* ================================================== */}

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            {/* DASHBOARD */}

            <Route
              path="/admin"
              element={<DashboardPage />}
            />

            {/* PRODUCTS */}

            <Route
              path="/admin/products"
              element={<AdminProductsPage />}
            />

            {/* CATEGORIES */}

            <Route
              path="/admin/categories"
              element={<AdminCategoriesPage />}
            />

            {/* BRANDS */}

            <Route
              path="/admin/brands"
              element={<AdminBrandsPage />}
            />

            {/* INVENTORY */}

            <Route
              path="/admin/inventory"
              element={<AdminInventoryPage />}
            />

            {/* ORDERS */}

            <Route
              path="/admin/orders"
              element={<AdminOrdersPage />}
            />

            {/* PAYMENTS */}

            <Route
              path="/admin/payments"
              element={<AdminPaymentsPage />}
            />

            {/* CUSTOMERS */}

            <Route
              path="/admin/customers"
              element={<AdminCustomersPage />}
            />

            {/* REVIEWS */}

            <Route
              path="/admin/reviews"
              element={<AdminReviewsPage />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;