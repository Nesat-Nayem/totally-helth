"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuUpdateValidation = exports.menuCreateValidation = void 0;
const zod_1 = require("zod");
exports.menuCreateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().url().optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
    restaurantPrice: zod_1.z.number().min(0).optional(),
    onlinePrice: zod_1.z.number().min(0).optional(),
    membershipPrice: zod_1.z.number().min(0).optional(),
    category: zod_1.z.string().optional(),
    brands: zod_1.z.array(zod_1.z.string()).optional(),
    branches: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
    // Nutrition fields
    calories: zod_1.z.number().min(0).optional(),
    protein: zod_1.z.number().min(0).optional(),
    carbs: zod_1.z.number().min(0).optional(),
    fibre: zod_1.z.number().min(0).optional(),
    sugars: zod_1.z.number().min(0).optional(),
    sodium: zod_1.z.number().min(0).optional(),
    iron: zod_1.z.number().min(0).optional(),
    calcium: zod_1.z.number().min(0).optional(),
    vitaminC: zod_1.z.number().min(0).optional(),
});
exports.menuUpdateValidation = exports.menuCreateValidation.partial();
