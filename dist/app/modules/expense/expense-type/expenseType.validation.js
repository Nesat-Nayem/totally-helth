"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseTypeUpdateValidation = exports.expenseTypeCreateValidation = void 0;
const zod_1 = require("zod");
exports.expenseTypeCreateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
exports.expenseTypeUpdateValidation = exports.expenseTypeCreateValidation.partial();
