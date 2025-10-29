import { z } from 'zod';

// Meal Item validation schema
export const mealItemSchema = z.object({
  productId: z.string().optional(),
  title: z.string().min(1, 'Meal title is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  punchingTime: z.string().optional(), // Will be converted to Date
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks', 'general']).optional(),
  moreOptions: z.array(z.object({
    name: z.string().min(1, 'Option name is required'),
  })).optional(),
  branchId: z.string().optional(),
  createdBy: z.string().optional(),
});

// UserMembership validation schemas
export const createUserMembershipSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'Customer ID is required'),
    mealPlanId: z.string().min(1, 'Meal Plan ID is required'),
    totalMeals: z.number().min(1, 'Total meals must be at least 1'),
    totalPrice: z.number().min(0, 'Total price must be non-negative'),
    receivedAmount: z.number().min(0, 'Received amount must be non-negative'),
    paymentMode: z.enum(['cash', 'card', 'online', 'payment_link']).optional(),
    paymentStatus: z.enum(['paid']).optional(),
    note: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().min(1, 'End date is required'),
  }),
});

export const updateUserMembershipSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Membership ID is required'),
  }),
  body: z.object({
    remainingMeals: z.number().min(0).optional(),
    consumedMeals: z.number().min(0).optional(),
    receivedAmount: z.number().min(0, 'Received amount must be non-negative').optional(),
    paymentMode: z.enum(['cash', 'card', 'online', 'payment_link']).optional(),
    paymentStatus: z.enum(['paid']).optional(),
    note: z.string().optional(),
    status: z.enum(['active', 'expired', 'cancelled', 'completed']).optional(),
    isActive: z.boolean().optional(),
    mealItems: z.array(mealItemSchema).optional(), // Optional meal items when updating membership
  }),
});

export const getUserMembershipSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Membership ID is required'),
  }),
});

export const getUserMembershipsSchema = z.object({
  query: z.object({
    userId: z.string().optional(),
    status: z.enum(['active', 'expired', 'cancelled', 'completed']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const deleteUserMembershipSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Membership ID is required'),
  }),
});
