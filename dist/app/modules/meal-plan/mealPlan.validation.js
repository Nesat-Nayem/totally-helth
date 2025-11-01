"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mealPlanUpdateValidation = exports.mealPlanValidation = exports.weekOfferSchema = void 0;
const zod_1 = require("zod");
exports.weekOfferSchema = zod_1.z.object({
    week: zod_1.z.string().min(1),
    offer: zod_1.z.string().min(1),
});
// New validation schemas for structured meal plan data
const mealTypeSchema = zod_1.z.object({
    breakfast: zod_1.z.array(zod_1.z.string().min(1)).length(3),
    lunch: zod_1.z.array(zod_1.z.string().min(1)).length(3),
    snacks: zod_1.z.array(zod_1.z.string().min(1)).length(3),
    dinner: zod_1.z.array(zod_1.z.string().min(1)).length(3),
});
const dayOfWeekEnum = zod_1.z.enum(['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
const weekDayPlanSchema = zod_1.z.object({
    day: dayOfWeekEnum,
    meals: mealTypeSchema,
});
const weekMealPlanSchema = zod_1.z.object({
    week: zod_1.z.number().int().min(1),
    // Provide exactly 7 day entries when specifying meals for this week
    days: zod_1.z.array(weekDayPlanSchema).length(7).optional(),
    // If provided, reuse a previous week's meals; when used, you can omit 'days'
    repeatFromWeek: zod_1.z.number().int().min(1).optional(),
});
exports.mealPlanValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string(),
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
    // New fields
    weeks: zod_1.z.array(weekMealPlanSchema).optional(),
});
exports.mealPlanUpdateValidation = exports.mealPlanValidation.partial();
