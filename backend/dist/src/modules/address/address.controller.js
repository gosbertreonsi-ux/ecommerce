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
exports.deleteAddress = exports.createAddress = exports.getAddresses = void 0;
const addressService = __importStar(require("./address.service"));
const address_validation_1 = require("./address.validation");
const getAddresses = async (req, res, next) => {
    try {
        console.log("AUTH USER:", req.user);
        const addresses = await addressService.getMyAddresses(req.user.id);
        console.log("ADDRESSES FROM DATABASE:", addresses);
        res.json({
            success: true,
            data: addresses,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAddresses = getAddresses;
const createAddress = async (req, res, next) => {
    try {
        const data = address_validation_1.createAddressSchema.parse(req.body);
        const address = await addressService.createAddress(req.user.id, data);
        res.status(201).json({
            success: true,
            message: "Address created successfully",
            data: address,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAddress = createAddress;
const deleteAddress = async (req, res, next) => {
    try {
        const addressId = Number(req.params.id);
        if (Number.isNaN(addressId)) {
            throw new Error("Invalid address ID");
        }
        const result = await addressService.deleteAddress(req.user.id, addressId);
        res.json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
