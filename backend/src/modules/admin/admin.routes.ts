import { Router } from "express";

import {
  authenticate,
} from "../../middlewares/auth.middleware";

import {
  requireAdmin,
} from "../../middlewares/role.middleware";

import * as adminController from "./admin.controller";

import productRoutes from "./products/product.routes";
import categoryRoutes from "./categories/category.routes";
import brandRoutes from "./brands/brand.routes";
import inventoryRoutes from "./inventory/inventory.routes";
import orderRoutes from "./orders/order.routes";
import paymentRoutes from "./payments/payment.routes";
import customerRoutes from "./customers/customer.routes";
import reviewRoutes from "./reviews/review.routes";

const router = Router();

router.use(authenticate);

router.use(requireAdmin);

router.get(
  "/dashboard",
  adminController.getDashboardStats,
);

router.use(
  "/products",
  productRoutes,
);

router.use(
  "/categories",
  categoryRoutes,
);

router.use(
  "/brands",
  brandRoutes,
);

router.use(
  "/inventory",
  inventoryRoutes,
);

router.use(
  "/orders",
  orderRoutes,
);

router.use(
  "/payments",
  paymentRoutes,
);

router.use(
  "/customers",
  customerRoutes,
);
    
router.use(
  "/reviews",
  reviewRoutes,
);

export default router;