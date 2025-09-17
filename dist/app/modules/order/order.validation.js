"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderUpdateValidation = exports.orderCreateValidation = exports.orderItemSchema = void 0;
const zod_1 = require("zod");
exports.orderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1),
    price: zod_1.z.number().nonnegative(),
    qty: zod_1.z.number().int().positive(),
});
exports.orderCreateValidation = zod_1.z.object({
    invoiceNo: zod_1.z.string().min(1).optional(),
    date: zod_1.z.string().or(zod_1.z.date()),
    customer: zod_1.z.union([
        zod_1.z.string(),
        zod_1.z.object({
            id: zod_1.z.string().optional(),
            name: zod_1.z.string().min(1),
            phone: zod_1.z.string().optional(),
        })
    ]).optional(),
    items: zod_1.z.array(exports.orderItemSchema).min(1),
    subTotal: zod_1.z.number().nonnegative(),
    total: zod_1.z.number().nonnegative(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    paymentMode: zod_1.z.string().optional(),
    branchId: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    aggregatorId: zod_1.z.string().optional(),
    paymentMethodId: zod_1.z.string().optional(),
    extraItems: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        price: zod_1.z.number().min(0),
        qty: zod_1.z.number().int().positive().default(1),
    }))
        .optional(),
    status: zod_1.z.enum(['paid', 'unpaid']).default('paid').optional(),
    // extended fields
    vatPercent: zod_1.z.number().min(0).max(100).optional(),
    vatAmount: zod_1.z.number().min(0).optional(),
    discountType: zod_1.z.enum(['flat', 'percent']).optional(),
    discountAmount: zod_1.z.number().min(0).optional(),
    shippingCharge: zod_1.z.number().min(0).optional(),
    rounding: zod_1.z.number().optional(),
    payableAmount: zod_1.z.number().min(0).optional(),
    receiveAmount: zod_1.z.number().min(0).optional(),
    changeAmount: zod_1.z.number().min(0).optional(),
    dueAmount: zod_1.z.number().min(0).optional(),
    note: zod_1.z.string().optional(),
});
exports.orderUpdateValidation = exports.orderCreateValidation.partial();
