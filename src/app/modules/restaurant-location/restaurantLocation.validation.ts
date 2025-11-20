import { z } from 'zod';

export const restaurantLocationCreateValidation = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  address: z.string().min(1, 'Address is required').trim(),
  image: z.string().optional(),
});

export const restaurantLocationUpdateValidation = z.object({
  name: z.string().min(1, 'Name is required').trim().optional(),
  address: z.string().min(1, 'Address is required').trim().optional(),
  image: z.string().optional(),
});

