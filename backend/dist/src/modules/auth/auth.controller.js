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
exports.me = exports.login = exports.register = void 0;
const authService = __importStar(require("./auth.service"));
const auth_validation_1 = require("./auth.validation");
const auth_validation_2 = require("./auth.validation");
const register = async (req, res, next) => {
    try {
        const data = auth_validation_1.registerSchema.parse(req.body);
        const user = await authService.register(data);
        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const data = auth_validation_2.loginSchema.parse(req.body);
        const result = await authService.login(data);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const me = async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
