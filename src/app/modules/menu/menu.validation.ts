import { z } from 'zod';

export const menuCreateValidation = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  restaurantPrice: z.number().min(0).optional(),
  onlinePrice: z.number().min(0).optional(),
  membershipPrice: z.number().min(0).optional(),
  category: z.string().optional(),
  brands: z.array(z.string()).optional(),
  branches: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  // Nutrition fields
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fibre: z.number().min(0).optional(),
  sugars: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  iron: z.number().min(0).optional(),
  calcium: z.number().min(0).optional(),
  vitaminC: z.number().min(0).optional(),
});

export const menuUpdateValidation = menuCreateValidation.partial();
