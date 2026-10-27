"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const adminController = __importStar(require("./admin.controller"));
const product_routes_1 = __importDefault(require("./products/product.routes"));
const category_routes_1 = __importDefault(require("./categories/category.routes"));
const brand_routes_1 = __importDefault(require("./brands/brand.routes"));
const inventory_routes_1 = __importDefault(require("./inventory/inventory.routes"));
const order_routes_1 = __importDefault(require("./orders/order.routes"));
const payment_routes_1 = __importDefault(require("./payments/payment.routes"));
const customer_routes_1 = __importDefault(require("./customers/customer.routes"));
const review_routes_1 = __importDefault(require("./reviews/review.routes"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use(role_middleware_1.requireAdmin);
router.get("/dashboard", adminController.getDashboardStats);
router.use("/products", product_routes_1.default);
router.use("/categories", category_routes_1.default);
router.use("/brands", brand_routes_1.default);
router.use("/inventory", inventory_routes_1.default);
router.use("/orders", order_routes_1.default);
router.use("/payments", payment_routes_1.default);
router.use("/customers", customer_routes_1.default);
router.use("/reviews", review_routes_1.default);
exports.default = router;
