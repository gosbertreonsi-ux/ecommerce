"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const parts = authorization.split(" ");
        if (parts.length !== 2 ||
            parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization header",
            });
        }
        const token = parts[1];
        req.user =
            (0, jwt_1.verifyToken)(token);
        next();
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.authenticate = authenticate;
