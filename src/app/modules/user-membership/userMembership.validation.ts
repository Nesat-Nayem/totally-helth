import { z } from 'zod';

// UserMembership validation schemas
export const createUserMembershipSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    mealPlanId: z.string().min(1, 'Meal Plan ID is required'),
    totalMeals: z.number().min(1, 'Total meals must be at least 1'),
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
