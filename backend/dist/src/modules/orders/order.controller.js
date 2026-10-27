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
exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const orderService = __importStar(require("./order.service"));
const order_validation_1 = require("./order.validation");
const createOrder = async (req, res, next) => {
    try {
        const data = order_validation_1.createOrderSchema.parse(req.body);
        const order = await orderService.createOrder(req.user.id, data);
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getMyOrders(req.user.id);
        res.status(200).json({
            success: true,
            data: orders,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyOrders = getMyOrders;
const getOrderById = async (req, res, next) => {
    try {
        const orderId = Number(req.params.id);
        if (!Number.isInteger(orderId) ||
            orderId <= 0) {
            throw new Error("Invalid order ID");
        }
        const order = await orderService.getOrderById(req.user.id, orderId);
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
