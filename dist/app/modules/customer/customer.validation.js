"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerUpdateValidation = exports.customerCreateValidation = void 0;
const zod_1 = require("zod");
exports.customerCreateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    address: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
exports.customerUpdateValidation = exports.customerCreateValidation.partial();
