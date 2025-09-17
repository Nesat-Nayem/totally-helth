"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethodUpdateValidation = exports.paymentMethodCreateValidation = void 0;
const zod_1 = require("zod");
exports.paymentMethodCreateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
exports.paymentMethodUpdateValidation = exports.paymentMethodCreateValidation.partial();
