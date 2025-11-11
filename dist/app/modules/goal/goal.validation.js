"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalUpdateValidation = exports.goalCreateValidation = exports.goalSectionSchema = void 0;
const zod_1 = require("zod");
exports.goalSectionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Section title is required'),
    icon: zod_1.z.string().min(1, 'Section icon is required'),
    description: zod_1.z.string().min(1, 'Section description is required'),
});
exports.goalCreateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    subtitle: zod_1.z.string().min(1, 'Subtitle is required'),
    sections: zod_1.z.array(exports.goalSectionSchema).min(1).max(3),
    metaTitle: zod_1.z.string().min(1, 'Meta title is required'),
    metaDescription: zod_1.z.string().min(1, 'Meta description is required'),
    metaKeywords: zod_1.z.string().min(1, 'Meta keywords are required'),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
exports.goalUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    subtitle: zod_1.z.string().min(1).optional(),
    sections: zod_1.z.array(exports.goalSectionSchema).min(1).max(3).optional(),
    metaTitle: zod_1.z.string().min(1).optional(),
    metaDescription: zod_1.z.string().min(1).optional(),
    metaKeywords: zod_1.z.string().min(1).optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
