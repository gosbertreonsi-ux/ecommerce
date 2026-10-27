"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulatePayment = exports.getPaymentByOrderId = exports.createPayment = void 0;
const API_URL = "http://localhost:5000/api";
const createPayment = async (token, orderId, method) => {
    const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            orderId,
            method,
        }),
    });
    const result = await response.json();
    if (!response.ok) {
        const message = typeof result === "object" &&
            result !== null &&
            "message" in result &&
            typeof result.message ===
                "string"
            ? result.message
            : "Failed to create payment";
        throw new Error(message);
    }
    return result;
};
exports.createPayment = createPayment;
const getPaymentByOrderId = async (token, orderId) => {
    const response = await fetch(`${API_URL}/payments/order/${orderId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const result = await response.json();
    if (!response.ok) {
        const message = typeof result === "object" &&
            result !== null &&
            "message" in result &&
            typeof result.message ===
                "string"
            ? result.message
            : "Failed to fetch payment";
        throw new Error(message);
    }
    return result;
};
exports.getPaymentByOrderId = getPaymentByOrderId;
const simulatePayment = async (token, paymentId, status, transactionId) => {
    const response = await fetch(`${API_URL}/payments/${paymentId}/simulate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            status,
            transactionId: transactionId ??
                null,
        }),
    });
    const result = await response.json();
    if (!response.ok) {
        const message = typeof result === "object" &&
            result !== null &&
            "message" in result &&
            typeof result.message ===
                "string"
            ? result.message
            : "Failed to simulate payment";
        throw new Error(message);
    }
    return result;
};
exports.simulatePayment = simulatePayment;
