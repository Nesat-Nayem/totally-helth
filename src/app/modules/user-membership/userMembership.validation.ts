import { z } from 'zod';

// Week meal plan validation schemas (same as meal plan)
const mealTypeSchema = z.object({
  breakfast: z.array(z.string().min(1)).max(3).optional(),
  lunch: z.array(z.string().min(1)).max(3).optional(),
  snacks: z.array(z.string().min(1)).max(3).optional(),
  dinner: z.array(z.string().min(1)).max(3).optional(),
});

const dayOfWeekEnum = z.enum(['saturday','sunday','monday','tuesday','wednesday','thursday','friday']);

const weekDayPlanSchema = z.object({
  day: dayOfWeekEnum,
  meals: mealTypeSchema,
});

const weekMealPlanSchema = z.object({
  week: z.number().int().min(1),
  // Provide exactly 7 day entries when specifying meals for this week
  days: z.array(weekDayPlanSchema).length(7).optional(),
  // If provided, reuse a previous week's meals; when used, you can omit 'days'
  repeatFromWeek: z.number().int().min(1).optional(),
});

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
    weeks: z.array(weekMealPlanSchema).optional(),
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
    status: z.enum(['active', 'hold', 'cancelled', 'completed']).optional(),
    mealItems: z.array(mealItemSchema).optional(), // Optional meal items when updating membership
    weeks: z.array(weekMealPlanSchema).optional(),
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
    status: z.enum(['active', 'hold', 'cancelled', 'completed']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const deleteUserMembershipSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Membership ID is required'),
  }),
});

export const setMembershipStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Membership ID is required'),
  }),
  body: z.object({
    status: z.enum(['hold', 'active', 'cancelled']),
  }),
});

// Meal items with quantities for punch API
const mealItemWithQtySchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']),
  mealItemTitle: z.string().min(1, 'Meal item title is required'),
  qty: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const punchMealsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Membership ID is required'),
  }),
  body: z.object({
    // Either provide date OR week+day, or omit both to use today's date
    date: z.string().optional(), // ISO date string (YYYY-MM-DD), defaults to today if not provided
    week: z.number().int().min(1, 'Week number must be at least 1').optional(),
    day: dayOfWeekEnum.optional(),
    // Support both: simple meal types OR detailed meal items with quantities
    consumedMealTypes: z.array(z.enum(['breakfast', 'lunch', 'dinner', 'snacks']))
      .min(1, 'At least one meal type must be consumed').optional(),
    mealItems: z.array(mealItemWithQtySchema).optional(), // Detailed meal items with quantities
    notes: z.string().optional(),
  }).refine(
    (data) => {
      // Must provide either consumedMealTypes OR mealItems
      const hasMealTypes = data.consumedMealTypes && data.consumedMealTypes.length > 0;
      const hasMealItems = data.mealItems && data.mealItems.length > 0;
      return hasMealTypes || hasMealItems;
    },
    {
      message: 'Either provide consumedMealTypes or mealItems',
      path: ['consumedMealTypes'],
    }
  ).refine(
    (data) => {
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
    },
    {
      message: 'Either provide date, or both week and day together, or omit both to use today',
      path: ['date'],
    }
  ),
});
