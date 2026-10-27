import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

import { errorHandler } from "./middlewares/error.middleware";

import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./modules/cart/cart.routes";
import addressRoutes from "./modules/address/address.routes";
import orderRoutes from "./modules/orders/order.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import adminRoutes from "./modules/admin/admin.routes";

const app = express();

// Security

app.use(
  cors(),
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

// Performance / Logging

app.use(
  compression(),
);

app.use(
  morgan("dev"),
);

app.use(
  cookieParser(),
);

// ========================================
// Request parsing
// ========================================

app.use(
  express.json(),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// ========================================
// Static uploaded files
// ========================================

app.use(
  "/uploads",
  express.static(
    path.resolve(
      process.cwd(),
      "uploads",
    ),
  ),
);

// ========================================
// API Routes
// ========================================

app.use(
  "/api/auth",
  authRoutes,
);

app.use(
  "/api/products",
  productRoutes,
);

app.use(
  "/api/cart",
  cartRoutes,
);

app.use(
  "/api/addresses",
  addressRoutes,
);

app.use(
  "/api/orders",
  orderRoutes,
);

app.use(
  "/api/payments",
  paymentRoutes,
);

app.use(
  "/api/reviews",
  reviewRoutes,
);

app.use(
  "/api/admin",
  adminRoutes,
);

// ========================================
// API health check
// ========================================

app.get(
  "/",
  (_req, res) => {
    res.json({
      success: true,
      message:
        "E-Commerce API is running successfully.",
    });
  },
);

// ========================================
// 404
// ========================================

app.use(
  (_req, res) => {
    res.status(404).json({
      success: false,
      message:
        "Route not found",
    });
  },
);

// ========================================
// Error handler
// ========================================

app.use(
  errorHandler,
);

export default app;