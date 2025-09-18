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
});

export const menuUpdateValidation = menuCreateValidation.partial();
