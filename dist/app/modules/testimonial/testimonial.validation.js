"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testimonialUpdateValidation = exports.testimonialCreateValidation = void 0;
const zod_1 = require("zod");
exports.testimonialCreateValidation = zod_1.z.object({
    quote: zod_1.z.string().min(1, 'Quote is required'),
    authorName: zod_1.z.string().min(1, 'Author name is required'),
    authorProfession: zod_1.z.string().min(1, 'Author profession is required'),
    order: zod_1.z.number().int().min(0).default(0),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
exports.testimonialUpdateValidation = zod_1.z.object({
    quote: zod_1.z.string().min(1).optional(),
    authorName: zod_1.z.string().min(1).optional(),
    authorProfession: zod_1.z.string().min(1).optional(),
    order: zod_1.z.number().int().min(0).optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
