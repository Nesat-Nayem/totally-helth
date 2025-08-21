"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mealPlanUpdateValidation = exports.mealPlanValidation = exports.weekOfferSchema = void 0;
const zod_1 = require("zod");
exports.weekOfferSchema = zod_1.z.object({
    week: zod_1.z.string().min(1),
    offer: zod_1.z.string().min(1),
});
exports.mealPlanValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    badge: zod_1.z.string().optional(),
    discount: zod_1.z.string().optional(),
    price: zod_1.z.number().nonnegative(),
    delPrice: zod_1.z.number().nonnegative().optional(),
    category: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    kcalList: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    deliveredList: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    suitableList: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    daysPerWeek: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    weeksOffers: zod_1.z.array(exports.weekOfferSchema).optional(),
    images: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    thumbnail: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
exports.mealPlanUpdateValidation = exports.mealPlanValidation.partial();
