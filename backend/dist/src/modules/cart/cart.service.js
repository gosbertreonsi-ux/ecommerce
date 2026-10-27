"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const productInclude = {
    category: true,
    brand: true,
    images: true,
    variants: true,
};
const cartItemInclude = {
    product: {
        include: productInclude,
    },
    variant: true,
};
/*
|--------------------------------------------------------------------------
| GET CART
|--------------------------------------------------------------------------
*/
const getCart = async (userId) => {
    let cart = await prisma_1.default.cart.findUnique({
        where: {
            userId,
        },
        include: {
            items: {
                include: cartItemInclude,
            },
        },
    });
    if (!cart) {
        cart = await prisma_1.default.cart.create({
            data: {
                userId,
            },
            include: {
                items: {
                    include: cartItemInclude,
                },
            },
        });
    }
    return cart;
};
exports.getCart = getCart;
/*
|--------------------------------------------------------------------------
| ADD ITEM TO CART
|--------------------------------------------------------------------------
*/
const addItem = async (userId, productId, variantId, quantity) => {
    const product = await prisma_1.default.product.findFirst({
        where: {
            id: productId,
            deletedAt: null,
        },
        include: {
            variants: true,
        },
    });
    if (!product) {
        throw new Error("Product not found");
    }
    if (!product.isActive) {
        throw new Error("Product is not available");
    }
    const variant = product.variants.find((item) => item.id === variantId);
    if (!variant) {
        throw new Error("Selected product variant not found");
    }
    if (variant.stock <= 0) {
        throw new Error("Selected variant is out of stock");
    }
    if (quantity >
        variant.stock) {
        throw new Error(`Insufficient stock. Available: ${variant.stock}`);
    }
    /*
    |--------------------------------------------------------------------------
    | GET OR CREATE CART
    |--------------------------------------------------------------------------
    */
    let cart = await prisma_1.default.cart.findUnique({
        where: {
            userId,
        },
    });
    if (!cart) {
        cart = await prisma_1.default.cart.create({
            data: {
                userId,
            },
        });
    }
    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING VARIANT
    |--------------------------------------------------------------------------
    */
    const existingItem = await prisma_1.default.cartItem.findUnique({
        where: {
            cartId_variantId: {
                cartId: cart.id,
                variantId,
            },
        },
    });
    if (existingItem) {
        const newQuantity = existingItem.quantity +
            quantity;
        if (newQuantity >
            variant.stock) {
            throw new Error(`Insufficient stock. Available: ${variant.stock}, already in cart: ${existingItem.quantity}`);
        }
        return prisma_1.default.cartItem.update({
            where: {
                id: existingItem.id,
            },
            data: {
                quantity: newQuantity,
            },
            include: cartItemInclude,
        });
    }
    /*
    |--------------------------------------------------------------------------
    | CREATE CART ITEM
    |--------------------------------------------------------------------------
    */
    return prisma_1.default.cartItem.create({
        data: {
            cartId: cart.id,
            productId,
            variantId,
            quantity,
        },
        include: cartItemInclude,
    });
};
exports.addItem = addItem;
/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM
|--------------------------------------------------------------------------
*/
const updateItem = async (userId, variantId, quantity) => {
    const cart = await prisma_1.default.cart.findUnique({
        where: {
            userId,
        },
    });
    if (!cart) {
        throw new Error("Cart not found");
    }
    const item = await prisma_1.default.cartItem.findUnique({
        where: {
            cartId_variantId: {
                cartId: cart.id,
                variantId,
            },
        },
        include: {
            product: true,
            variant: true,
        },
    });
    if (!item) {
        throw new Error("Cart item not found");
    }
    if (!item.variant) {
        throw new Error("Cart item has no product variant configured");
    }
    if (!item.product.isActive) {
        throw new Error("Product is not available");
    }
    if (item.variant.stock <= 0) {
        throw new Error("Selected variant is out of stock");
    }
    if (quantity >
        item.variant.stock) {
        throw new Error(`Insufficient stock. Available: ${item.variant.stock}`);
    }
    return prisma_1.default.cartItem.update({
        where: {
            id: item.id,
        },
        data: {
            quantity,
        },
        include: cartItemInclude,
    });
};
exports.updateItem = updateItem;
/*
|--------------------------------------------------------------------------
| REMOVE ITEM
|--------------------------------------------------------------------------
*/
const removeItem = async (userId, variantId) => {
    const cart = await prisma_1.default.cart.findUnique({
        where: {
            userId,
        },
    });
    if (!cart) {
        throw new Error("Cart not found");
    }
    const item = await prisma_1.default.cartItem.findUnique({
        where: {
            cartId_variantId: {
                cartId: cart.id,
                variantId,
            },
        },
    });
    if (!item) {
        throw new Error("Cart item not found");
    }
    await prisma_1.default.cartItem.delete({
        where: {
            id: item.id,
        },
    });
    return {
        message: "Item removed from cart",
    };
};
exports.removeItem = removeItem;
/*
|--------------------------------------------------------------------------
| CLEAR CART
|--------------------------------------------------------------------------
*/
const clearCart = async (userId) => {
    const cart = await prisma_1.default.cart.findUnique({
        where: {
            userId,
        },
    });
    if (!cart) {
        return {
            message: "Cart cleared",
        };
    }
    await prisma_1.default.cartItem.deleteMany({
        where: {
            cartId: cart.id,
        },
    });
    return {
        message: "Cart cleared",
    };
};
exports.clearCart = clearCart;
