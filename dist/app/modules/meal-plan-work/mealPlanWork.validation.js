"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mealPlanWorkUpdateValidation = exports.mealPlanWorkCreateValidation = exports.mealPlanWorkStepSchema = void 0;
const zod_1 = require("zod");
exports.mealPlanWorkStepSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Step title is required'),
    subTitle: zod_1.z.string().min(1, 'Step subtitle is required'),
});
exports.mealPlanWorkCreateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    subtitle: zod_1.z.string().min(1, 'Subtitle is required'),
    banner1: zod_1.z.string().min(1, 'Banner 1 is required'),
    banner2: zod_1.z.string().min(1, 'Banner 2 is required'),
    step1: exports.mealPlanWorkStepSchema,
    step2: exports.mealPlanWorkStepSchema,
    step3: exports.mealPlanWorkStepSchema,
    metaTitle: zod_1.z.string().min(1, 'Meta title is required'),
    metaTagKeyword: zod_1.z.string().min(1, 'Meta tag keyword is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
exports.mealPlanWorkUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    subtitle: zod_1.z.string().min(1).optional(),
    banner1: zod_1.z.string().min(1).optional(),
    banner2: zod_1.z.string().min(1).optional(),
    step1: exports.mealPlanWorkStepSchema.optional(),
    step2: exports.mealPlanWorkStepSchema.optional(),
    step3: exports.mealPlanWorkStepSchema.optional(),
    metaTitle: zod_1.z.string().min(1).optional(),
    metaTagKeyword: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().min(1).optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
