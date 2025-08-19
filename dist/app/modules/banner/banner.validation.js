"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerUpdateValidation = exports.bannerValidation = void 0;
const zod_1 = require("zod");
exports.bannerValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Banner title is required'),
    image: zod_1.z.string().min(1, 'Banner image is required'),
    certLogo: zod_1.z.string().min(1, 'Certification logo is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    metaTitle: zod_1.z.string().min(1, 'Meta title is required'),
    metaDescription: zod_1.z.string().min(1, 'Meta description is required'),
    metaKeywords: zod_1.z.string().min(1, 'Meta keywords are required'),
    googleReviewCount: zod_1.z.number().int().nonnegative('Count must be >= 0'),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
    order: zod_1.z.number().optional(),
});
exports.bannerUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Banner title is required').optional(),
    image: zod_1.z.string().min(1, 'Banner image is required').optional(),
    certLogo: zod_1.z.string().min(1, 'Certification logo is required').optional(),
    description: zod_1.z.string().min(1, 'Description is required').optional(),
    metaTitle: zod_1.z.string().min(1, 'Meta title is required').optional(),
    metaDescription: zod_1.z.string().min(1, 'Meta description is required').optional(),
    metaKeywords: zod_1.z.string().min(1, 'Meta keywords are required').optional(),
    googleReviewCount: zod_1.z.number().int().nonnegative('Count must be >= 0').optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
    order: zod_1.z.number().optional(),
});
