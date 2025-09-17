"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandUpdateValidation = exports.brandCreateValidation = void 0;
const zod_1 = require("zod");
exports.brandCreateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1),
    logo: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
exports.brandUpdateValidation = exports.brandCreateValidation.partial();
