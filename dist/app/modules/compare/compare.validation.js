"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareUpdateValidation = exports.compareCreateValidation = exports.compareItemSchema = void 0;
const zod_1 = require("zod");
exports.compareItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Item title is required'),
    included: zod_1.z.boolean(),
});
exports.compareCreateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    banner1: zod_1.z.string().min(1, 'Banner 1 is required'),
    banner2: zod_1.z.string().min(1, 'Banner 2 is required'),
    compareItems: zod_1.z.array(exports.compareItemSchema).optional(),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
exports.compareUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    banner1: zod_1.z.string().min(1).optional(),
    banner2: zod_1.z.string().min(1).optional(),
    compareItems: zod_1.z.array(exports.compareItemSchema).optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
