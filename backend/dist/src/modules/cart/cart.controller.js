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
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const cartService = __importStar(require("./cart.service"));
const cart_validation_1 = require("./cart.validation");
/*
|--------------------------------------------------------------------------
| GET CART
|--------------------------------------------------------------------------
*/
const getCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.user.id);
        res.status(200).json({
            success: true,
            data: cart,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
/*
|--------------------------------------------------------------------------
| ADD ITEM
|--------------------------------------------------------------------------
*/
const addItem = async (req, res, next) => {
    try {
        const data = cart_validation_1.addCartItemSchema.parse(req.body);
        const item = await cartService.addItem(req.user.id, data.productId, data.variantId, data.quantity);
        res.status(201).json({
            success: true,
            message: "Product variant added to cart",
            data: item,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addItem = addItem;
/*
|--------------------------------------------------------------------------
| UPDATE ITEM
|--------------------------------------------------------------------------
*/
const updateItem = async (req, res, next) => {
    try {
        const variantId = Number(req.params.variantId);
        if (!Number.isInteger(variantId) ||
            variantId <= 0) {
            throw new Error("Invalid variant ID");
        }
        const data = cart_validation_1.updateCartItemSchema.parse(req.body);
        const item = await cartService.updateItem(req.user.id, variantId, data.quantity);
        res.status(200).json({
            success: true,
            message: "Cart item updated",
            data: item,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateItem = updateItem;
/*
|--------------------------------------------------------------------------
| REMOVE ITEM
|--------------------------------------------------------------------------
*/
const removeItem = async (req, res, next) => {
    try {
        const variantId = Number(req.params.variantId);
        if (!Number.isInteger(variantId) ||
            variantId <= 0) {
            throw new Error("Invalid variant ID");
        }
        const result = await cartService.removeItem(req.user.id, variantId);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeItem = removeItem;
/*
|--------------------------------------------------------------------------
| CLEAR CART
|--------------------------------------------------------------------------
*/
const clearCart = async (req, res, next) => {
    try {
        const result = await cartService.clearCart(req.user.id);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.clearCart = clearCart;
