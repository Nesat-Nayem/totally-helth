"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseUpdateValidation = exports.expenseCreateValidation = void 0;
const zod_1 = require("zod");
// Helper to coerce string numbers to numbers
const numberCoerce = zod_1.z.coerce.number().min(0);
// Helper to validate ObjectId (string with min length 1, optionally validate format)
const objectIdValidation = zod_1.z.string().min(1);
exports.expenseCreateValidation = zod_1.z.object({
    invoiceId: zod_1.z.string().min(1),
    invoiceDate: zod_1.z.string().or(zod_1.z.date()),
    expenseType: objectIdValidation,
    description: zod_1.z.string().optional().or(zod_1.z.literal('')),
    supplier: objectIdValidation,
    paymentMethod: zod_1.z.string().min(1),
    paymentReferenceNo: zod_1.z.string().optional().or(zod_1.z.literal('')),
    baseAmount: numberCoerce,
    taxPercent: numberCoerce.optional(),
    taxAmount: numberCoerce.optional(),
    vatPercent: numberCoerce.optional(),
    vatAmount: numberCoerce.optional(),
    grandTotal: numberCoerce.optional(),
    approvedBy: objectIdValidation,
    notes: zod_1.z.string().optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
exports.expenseUpdateValidation = zod_1.z.object({
    invoiceId: zod_1.z.string().min(1).optional(),
    invoiceDate: zod_1.z.string().or(zod_1.z.date()).optional(),
    expenseType: objectIdValidation.optional(),
    description: zod_1.z.string().optional().or(zod_1.z.literal('')),
    supplier: objectIdValidation.optional(),
    paymentMethod: zod_1.z.string().min(1).optional(),
    paymentReferenceNo: zod_1.z.string().optional().or(zod_1.z.literal('')),
    baseAmount: numberCoerce.optional(),
    taxPercent: numberCoerce.optional(),
    taxAmount: numberCoerce.optional(),
    vatPercent: numberCoerce.optional(),
    vatAmount: numberCoerce.optional(),
    grandTotal: numberCoerce.optional(),
    approvedBy: objectIdValidation.optional(),
    notes: zod_1.z.string().optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
