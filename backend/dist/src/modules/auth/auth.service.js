"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const jwt_1 = require("../../utils/jwt");
// ==============================
// REGISTER
// ==============================
const register = async (data) => {
    // Check if email already exists
    const existingUser = await prisma_1.default.user.findUnique({
        where: {
            email: data.email,
        },
    });
    if (existingUser) {
        throw new Error("Email already exists");
    }
    // Find CUSTOMER role
    const customerRole = await prisma_1.default.role.findUnique({
        where: {
            name: "CUSTOMER",
        },
    });
    if (!customerRole) {
        throw new Error("Customer role not found");
    }
    // Hash password
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    // Create user
    const user = await prisma_1.default.user.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            roleId: customerRole.id,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
        },
    });
    return user;
};
exports.register = register;
// ==============================
// LOGIN
// ==============================
const login = async (data) => {
    // Find user
    const user = await prisma_1.default.user.findUnique({
        where: {
            email: data.email,
        },
        include: {
            role: true,
        },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    // Compare password
    const passwordMatch = await bcrypt_1.default.compare(data.password, user.password);
    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }
    // Generate JWT
    const token = (0, jwt_1.generateToken)({
        id: user.id,
        role: user.role.name,
    });
    return {
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role.name,
        },
        token,
    };
};
exports.login = login;
// ==============================
// GET CURRENT USER
// ==============================
const getCurrentUser = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
                select: {
                    name: true,
                },
            },
            createdAt: true,
        },
    });
    return user;
};
exports.getCurrentUser = getCurrentUser;
