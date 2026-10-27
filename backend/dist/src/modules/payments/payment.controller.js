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
exports.simulatePayment = exports.getPaymentByOrderId = exports.createPayment = void 0;
const paymentService = __importStar(require("./payment.service"));
const payment_validation_1 = require("./payment.validation");
const createPayment = async (req, res, next) => {
    try {
        const data = payment_validation_1.createPaymentSchema.parse(req.body);
        const payment = await paymentService.createPayment(req.user.id, data);
        res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: payment,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPayment = createPayment;
const getPaymentByOrderId = async (req, res, next) => {
    try {
        const orderId = Number(req.params.orderId);
        if (!Number.isInteger(orderId) ||
            orderId <= 0) {
            throw new Error("Invalid order ID");
        }
        const payment = await paymentService.getPaymentByOrderId(req.user.id, orderId);
        res.status(200).json({
            success: true,
            data: payment,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentByOrderId = getPaymentByOrderId;
const simulatePayment = async (req, res, next) => {
    try {
        const paymentId = Number(req.params.id);
        if (!Number.isInteger(paymentId) ||
            paymentId <= 0) {
            throw new Error("Invalid payment ID");
        }
        const status = req.body.status;
        if (status !== "SUCCESS" &&
            status !== "FAILED") {
            throw new Error("Simulation status must be SUCCESS or FAILED");
        }
        const transactionId = typeof req.body
            .transactionId ===
            "string"
            ? req.body.transactionId
            : null;
        const payment = await paymentService.simulatePayment(req.user.id, paymentId, status, transactionId);
        res.status(200).json({
            success: true,
            message: "Payment simulation completed successfully",
            data: payment,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.simulatePayment = simulatePayment;
