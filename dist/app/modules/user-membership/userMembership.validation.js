"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserMembershipSchema = exports.getUserMembershipsSchema = exports.getUserMembershipSchema = exports.updateUserMembershipSchema = exports.createUserMembershipSchema = exports.mealItemSchema = void 0;
const zod_1 = require("zod");
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
