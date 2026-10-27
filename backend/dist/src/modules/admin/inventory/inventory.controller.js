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
exports.adjustInventory = exports.getInventoryMovements = exports.getLowStockInventory = exports.getInventory = void 0;
const inventoryService = __importStar(require("./inventory.service"));
const inventory_validation_1 = require("./inventory.validation");
const getInventory = async (_req, res, next) => {
    try {
        const inventory = await inventoryService.getInventory();
        res.status(200).json({
            success: true,
            data: inventory,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventory = getInventory;
const getLowStockInventory = async (req, res, next) => {
    try {
        const thresholdValue = req.query.threshold;
        const threshold = thresholdValue ===
            undefined
            ? 5
            : Number(thresholdValue);
        const inventory = await inventoryService.getLowStockInventory(threshold);
        res.status(200).json({
            success: true,
            data: inventory,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLowStockInventory = getLowStockInventory;
const getInventoryMovements = async (req, res, next) => {
    try {
        const query = inventory_validation_1.inventoryQuerySchema.parse(req.query);
        const movements = await inventoryService.getInventoryMovements(query);
        res.status(200).json({
            success: true,
            data: movements,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryMovements = getInventoryMovements;
const adjustInventory = async (req, res, next) => {
    try {
        const data = inventory_validation_1.adjustInventorySchema.parse(req.body);
        const inventory = await inventoryService.adjustInventory(data);
        res.status(200).json({
            success: true,
            message: "Inventory updated successfully",
            data: inventory,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adjustInventory = adjustInventory;
