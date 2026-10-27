"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCustomer = exports.requireAdmin = exports.requireRole = void 0;
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource",
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)("ADMIN");
exports.requireCustomer = (0, exports.requireRole)("CUSTOMER");
