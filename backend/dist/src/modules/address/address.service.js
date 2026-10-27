"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.createAddress = exports.getMyAddresses = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getMyAddresses = async (userId) => {
    return prisma_1.default.address.findMany({
        where: {
            userId,
            deletedAt: null,
        },
        orderBy: [
            {
                isDefault: "desc",
            },
            {
                createdAt: "desc",
            },
        ],
    });
};
exports.getMyAddresses = getMyAddresses;
const createAddress = async (userId, data) => {
    if (data.isDefault) {
        await prisma_1.default.address.updateMany({
            where: {
                userId,
                deletedAt: null,
            },
            data: {
                isDefault: false,
            },
        });
    }
    return prisma_1.default.address.create({
        data: {
            ...data,
            userId,
        },
    });
};
exports.createAddress = createAddress;
const deleteAddress = async (userId, addressId) => {
    const address = await prisma_1.default.address.findFirst({
        where: {
            id: addressId,
            userId,
            deletedAt: null,
        },
    });
    if (!address) {
        throw new Error("Address not found");
    }
    await prisma_1.default.address.update({
        where: {
            id: addressId,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    return {
        message: "Address deleted",
    };
};
exports.deleteAddress = deleteAddress;
