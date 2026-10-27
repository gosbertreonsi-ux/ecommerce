"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues,
        });
    }
    if (err instanceof Error) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};
exports.errorHandler = errorHandler;
