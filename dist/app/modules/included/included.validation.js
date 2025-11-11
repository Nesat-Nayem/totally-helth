"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includedUpdateValidation = exports.includedValidation = void 0;
const zod_1 = require("zod");
exports.includedValidation = zod_1.z.object({
    meal_type: zod_1.z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS']),
    title: zod_1.z.string().min(1, 'Title is required'),
    image_url: zod_1.z.string().min(1, 'Image URL is required'),
    nutrition: zod_1.z.object({
        calories: zod_1.z.number().nonnegative('Calories must be >= 0'),
        fat_g: zod_1.z.number().nonnegative('Fat must be >= 0'),
        carbs_g: zod_1.z.number().nonnegative('Carbs must be >= 0'),
        protein_g: zod_1.z.number().nonnegative('Protein must be >= 0'),
    }),
    allergens: zod_1.z.array(zod_1.z.string()).default([]),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
    order: zod_1.z.number().optional(),
});
exports.includedUpdateValidation = zod_1.z.object({
    meal_type: zod_1.z.enum(['BREAKFAST', 'LUNCH', 'DINNER']).optional(),
    title: zod_1.z.string().min(1, 'Title is required').optional(),
    image_url: zod_1.z.string().min(1, 'Image URL is required').optional(),
    nutrition: zod_1.z
        .object({
        calories: zod_1.z.number().nonnegative('Calories must be >= 0'),
        fat_g: zod_1.z.number().nonnegative('Fat must be >= 0'),
        carbs_g: zod_1.z.number().nonnegative('Carbs must be >= 0'),
        protein_g: zod_1.z.number().nonnegative('Protein must be >= 0'),
    })
        .optional(),
    allergens: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
    order: zod_1.z.number().optional(),
});
