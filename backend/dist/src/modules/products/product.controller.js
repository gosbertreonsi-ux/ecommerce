"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsController = getProductsController;
exports.getProductByIdController = getProductByIdController;
const product_service_1 = require("./product.service");
async function getProductsController(req, res, next) {
    try {
        const products = await (0, product_service_1.getProducts)();
        res.json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getProductByIdController(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
            return;
        }
        const product = await (0, product_service_1.getProductById)(id);
        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }
        res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
}
