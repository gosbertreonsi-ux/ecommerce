"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = require("zod");
exports.createAddressSchema = zod_1.z.object({
    label: zod_1.z.string().min(1),
    street: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    region: zod_1.z.string().min(1),
    postalCode: zod_1.z.string().optional(),
    country: zod_1.z.string().min(1),
    isDefault: zod_1.z.boolean().optional(),
});
exports.updateAddressSchema = exports.createAddressSchema.partial();
