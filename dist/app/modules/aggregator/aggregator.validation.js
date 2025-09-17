"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregatorUpdateValidation = exports.aggregatorCreateValidation = void 0;
const zod_1 = require("zod");
exports.aggregatorCreateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1),
    logo: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
exports.aggregatorUpdateValidation = exports.aggregatorCreateValidation.partial();
