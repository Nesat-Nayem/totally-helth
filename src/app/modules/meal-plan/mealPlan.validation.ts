import { z } from 'zod';

export const weekOfferSchema = z.object({
  week: z.string().min(1),
  offer: z.string().min(1),
});

export const mealPlanValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
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
});

export const mealPlanUpdateValidation = mealPlanValidation.partial();
