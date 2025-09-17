"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchUpdateValidation = exports.branchCreateValidation = void 0;
const zod_1 = require("zod");
exports.branchCreateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    location: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    logo: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
exports.branchUpdateValidation = zod_1.z.object({
    name: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    logo: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
