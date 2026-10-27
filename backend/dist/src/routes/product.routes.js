"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../modules/products/product.controller");
const router = (0, express_1.Router)();
router.get("/", product_controller_1.getProductsController);
router.get("/:id", product_controller_1.getProductByIdController);
exports.default = router;
