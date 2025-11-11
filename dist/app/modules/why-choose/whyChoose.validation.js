"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whyChooseUpdateValidation = exports.whyChooseCreateValidation = exports.whyChooseCardSchema = void 0;
const zod_1 = require("zod");
exports.whyChooseCardSchema = zod_1.z.object({
    icon: zod_1.z.string().min(1, 'Card icon is required'),
    title: zod_1.z.string().min(1, 'Card title is required'),
    items: zod_1.z.array(zod_1.z.string().min(1)).min(1, 'Card items array must contain at least one item'),
});
exports.whyChooseCreateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    subTitle: zod_1.z.string().min(1, 'Subtitle is required'),
    card1: exports.whyChooseCardSchema,
    card2: exports.whyChooseCardSchema,
    card3: exports.whyChooseCardSchema,
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
exports.whyChooseUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    subTitle: zod_1.z.string().min(1).optional(),
    card1: exports.whyChooseCardSchema.optional(),
    card2: exports.whyChooseCardSchema.optional(),
    card3: exports.whyChooseCardSchema.optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
