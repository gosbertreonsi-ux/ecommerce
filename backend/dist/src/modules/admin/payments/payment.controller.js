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
exports.updatePaymentStatus = exports.getPaymentById = exports.getPayments = void 0;
const paymentService = __importStar(require("./payment.service"));
const payment_validation_1 = require("./payment.validation");
const getPayments = async (req, res, next) => {
    try {
        const query = payment_validation_1.paymentQuerySchema.parse(req.query);
        const payments = await paymentService.getPayments(query);
        res.status(200).json({
            success: true,
            data: payments,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPayments = getPayments;
const getPaymentById = async (req, res, next) => {
    try {
        const paymentId = Number(req.params.id);
        if (!Number.isInteger(paymentId) ||
            paymentId <= 0) {
            throw new Error("Invalid payment ID");
        }
        const payment = await paymentService.getPaymentById(paymentId);
        res.status(200).json({
            success: true,
            data: payment,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentById = getPaymentById;
const updatePaymentStatus = async (req, res, next) => {
    try {
        const paymentId = Number(req.params.id);
        if (!Number.isInteger(paymentId) ||
            paymentId <= 0) {
            throw new Error("Invalid payment ID");
        }
        const data = payment_validation_1.updatePaymentStatusSchema.parse(req.body);
        const payment = await paymentService.updatePaymentStatus(paymentId, data);
        res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            data: payment,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
