"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMealSelectionsSchema = exports.punchMealsSchema = exports.setMembershipStatusSchema = exports.deleteUserMembershipSchema = exports.getUserMembershipsSchema = exports.getUserMembershipSchema = exports.updateUserMembershipSchema = exports.createUserMembershipSchema = exports.mealItemSchema = void 0;
const zod_1 = require("zod");
// Week meal plan validation schemas (same as meal plan)
const mealTypeSchema = zod_1.z.object({
    breakfast: zod_1.z.array(zod_1.z.string().min(1)).max(3).optional(),
    lunch: zod_1.z.array(zod_1.z.string().min(1)).max(3).optional(),
    snacks: zod_1.z.array(zod_1.z.string().min(1)).max(3).optional(),
    dinner: zod_1.z.array(zod_1.z.string().min(1)).max(3).optional(),
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
// Meal Item validation schema
exports.mealItemSchema = zod_1.z.object({
    productId: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1, 'Meal title is required'),
    qty: zod_1.z.number().min(1, 'Quantity must be at least 1'),
    punchingTime: zod_1.z.string().optional(), // Will be converted to Date
    mealType: zod_1.z.enum(['breakfast', 'lunch', 'dinner', 'snacks', 'general']).optional(),
    moreOptions: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1, 'Option name is required'),
    })).optional(),
    branchId: zod_1.z.string().optional(),
    createdBy: zod_1.z.string().optional(),
});
// UserMembership validation schemas
exports.createUserMembershipSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().min(1, 'Customer ID is required'),
        mealPlanId: zod_1.z.string().min(1, 'Meal Plan ID is required'),
        totalMeals: zod_1.z.number().min(1, 'Total meals must be at least 1'),
        totalPrice: zod_1.z.number().min(0, 'Total price must be non-negative'),
        receivedAmount: zod_1.z.number().min(0, 'Received amount must be non-negative'),
        paymentMode: zod_1.z.enum(['cash', 'card', 'online', 'payment_link']).optional(),
        paymentStatus: zod_1.z.enum(['paid']).optional(),
        note: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().min(1, 'End date is required'),
        weeks: zod_1.z.array(weekMealPlanSchema).optional(),
    }),
});
exports.updateUserMembershipSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Membership ID is required'),
    }),
    body: zod_1.z.object({
        remainingMeals: zod_1.z.number().min(0).optional(),
        consumedMeals: zod_1.z.number().min(0).optional(),
        receivedAmount: zod_1.z.number().min(0, 'Received amount must be non-negative').optional(),
        paymentMode: zod_1.z.enum(['cash', 'card', 'online', 'payment_link']).optional(),
        paymentStatus: zod_1.z.enum(['paid']).optional(),
        note: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'hold', 'cancelled', 'completed']).optional(),
        mealItems: zod_1.z.array(exports.mealItemSchema).optional(), // Optional meal items when updating membership
        weeks: zod_1.z.array(weekMealPlanSchema).optional(),
    }),
});
exports.getUserMembershipSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Membership ID is required'),
    }),
});
exports.getUserMembershipsSchema = zod_1.z.object({
    query: zod_1.z.object({
        userId: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'hold', 'cancelled', 'completed']).optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }),
});
exports.deleteUserMembershipSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Membership ID is required'),
    }),
});
exports.setMembershipStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Membership ID is required'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['hold', 'active', 'cancelled']),
    }),
});
// Meal items with quantities for punch API
const mealItemWithQtySchema = zod_1.z.object({
    mealType: zod_1.z.enum(['breakfast', 'lunch', 'dinner', 'snacks']),
    mealItemTitle: zod_1.z.string().min(1, 'Meal item title is required'),
    qty: zod_1.z.number().int().min(1, 'Quantity must be at least 1').default(1),
});
exports.punchMealsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Membership ID is required'),
    }),
    body: zod_1.z.object({
        // Either provide date OR week+day, or omit both to use today's date
        date: zod_1.z.string().optional(), // ISO date string (YYYY-MM-DD), defaults to today if not provided
        week: zod_1.z.number().int().min(1, 'Week number must be at least 1').optional(),
        day: dayOfWeekEnum.optional(),
        // Support both: simple meal types OR detailed meal items with quantities
        consumedMealTypes: zod_1.z.array(zod_1.z.enum(['breakfast', 'lunch', 'dinner', 'snacks']))
            .min(1, 'At least one meal type must be consumed').optional(),
        mealItems: zod_1.z.array(mealItemWithQtySchema).optional(), // Detailed meal items with quantities
        notes: zod_1.z.string().optional(),
    }).refine((data) => {
        // Must provide either consumedMealTypes OR mealItems
        const hasMealTypes = data.consumedMealTypes && data.consumedMealTypes.length > 0;
        const hasMealItems = data.mealItems && data.mealItems.length > 0;
        return hasMealTypes || hasMealItems;
    }, {
        message: 'Either provide consumedMealTypes or mealItems',
        path: ['consumedMealTypes'],
    }).refine((data) => {
        // Either date is provided, OR both week and day are provided, OR neither (will default to today)
        const hasDate = data.date !== undefined;
        const hasWeekAndDay = data.week !== undefined && data.day !== undefined;
        const hasOnlyWeek = data.week !== undefined && data.day === undefined;
        const hasOnlyDay = data.day !== undefined && data.week === undefined;
        // Invalid: only week or only day
        if (hasOnlyWeek || hasOnlyDay) {
            return false;
        }
        // Valid: date provided, OR week+day provided, OR neither
        return hasDate || hasWeekAndDay || (!hasDate && !hasWeekAndDay);
    }, {
        message: 'Either provide date, or both week and day together, or omit both to use today',
        path: ['date'],
    }),
});
// Validation schema for updating meal selections for a specific week and day
exports.updateMealSelectionsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Membership ID is required'),
    }),
    body: zod_1.z.object({
        week: zod_1.z.number().int().min(1, 'Week number must be at least 1'),
        day: dayOfWeekEnum,
        meals: mealTypeSchema, // The updated meal selections (at least one meal type must be provided)
    }).refine((data) => {
        // Ensure at least one meal type is provided
        const meals = data.meals || {};
        return meals.breakfast !== undefined ||
            meals.lunch !== undefined ||
            meals.snacks !== undefined ||
            meals.dinner !== undefined;
    }, {
        message: 'At least one meal type (breakfast, lunch, snacks, or dinner) must be provided',
        path: ['meals'],
    }),
});
