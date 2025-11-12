import { z } from 'zod';

export const logoValidation = z.object({
  image: z.string().min(1, 'Logo image is required'),
  status: z.enum(['active', 'inactive']).default('active'),
  order: z.number().optional(),
});

export const logoUpdateValidation = z.object({
  image: z.string().min(1, 'Logo image is required').optional(),
  status: z.enum(['active', 'inactive']).optional(),
  order: z.number().optional(),
});

