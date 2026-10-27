"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const error_middleware_1 = require("./middlewares/error.middleware");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const cart_routes_1 = __importDefault(require("./modules/cart/cart.routes"));
const address_routes_1 = __importDefault(require("./modules/address/address.routes"));
const order_routes_1 = __importDefault(require("./modules/orders/order.routes"));
const payment_routes_1 = __importDefault(require("./modules/payments/payment.routes"));
const review_routes_1 = __importDefault(require("./modules/reviews/review.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const app = (0, express_1.default)();
// ========================================
// Security
// ========================================
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: {
        policy: "cross-origin",
    },
}));
// ========================================
// Performance / Logging
// ========================================
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
// ========================================
// Request parsing
// ========================================
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
// ========================================
// Static uploaded files
// ========================================
app.use("/uploads", express_1.default.static(path_1.default.resolve(process.cwd(), "uploads")));
// ========================================
// API Routes
// ========================================
app.use("/api/auth", auth_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/addresses", address_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/payments", payment_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
// ========================================
// API health check
// ========================================
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "E-Commerce API is running successfully.",
    });
});
// ========================================
// 404
// ========================================
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
// ========================================
// Error handler
// ========================================
app.use(error_middleware_1.errorHandler);
exports.default = app;
