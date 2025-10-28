import { z } from 'zod';

// UserMembership validation schemas
export const createUserMembershipSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'Customer ID is required'),
    mealPlanId: z.string().min(1, 'Meal Plan ID is required'),
    totalMeals: z.number().min(1, 'Total meals must be at least 1'),
    totalPrice: z.number().min(0, 'Total price must be non-negative'),
    receivedAmount: z.number().min(0, 'Additional payment amount must be non-negative').optional(),
    paymentMode: z.enum(['cash', 'card', 'online', 'payment_link']).optional(),
    paymentStatus: z.enum(['paid', 'unpaid', 'partial']).optional(),
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
    receivedAmount: z.number().min(0, 'Additional payment amount must be non-negative').optional(),
    paymentMode: z.enum(['cash', 'card', 'online', 'payment_link']).optional(),
    paymentStatus: z.enum(['paid', 'unpaid', 'partial']).optional(),
    note: z.string().optional(),
    status: z.enum(['active', 'expired', 'cancelled', 'completed']).optional(),
    isActive: z.boolean().optional(),
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
