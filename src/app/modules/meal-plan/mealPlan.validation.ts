  import { z } from 'zod';

  export const weekOfferSchema = z.object({
    week: z.string().min(1),
    offer: z.string().min(1),
  });

  // New validation schemas for structured meal plan data
  const mealTypeSchema = z.object({
    breakfast: z.array(z.string().min(1)).length(3),
    lunch: z.array(z.string().min(1)).length(3),
    snacks: z.array(z.string().min(1)).length(3),
    dinner: z.array(z.string().min(1)).length(3),
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

  export const mealPlanValidation = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    badge: z.string().optional(),
    discount: z.string().optional(),
    price: z.number().nonnegative(),
    delPrice: z.number().nonnegative().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    kcalList: z.array(z.string().min(1)).optional(),
    deliveredList: z.array(z.string().min(1)).optional(),
    suitableList: z.array(z.string().min(1)).optional(),
    daysPerWeek: z.array(z.string().min(1)).optional(),
    weeksOffers: z.array(weekOfferSchema).optional(),
    images: z.array(z.string().min(1)).optional(),
    thumbnail: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
    showOnClient: z.boolean().default(true),
    // New fields
    weeks: z.array(weekMealPlanSchema).optional(),
  });

  export const mealPlanUpdateValidation = mealPlanValidation.partial();
