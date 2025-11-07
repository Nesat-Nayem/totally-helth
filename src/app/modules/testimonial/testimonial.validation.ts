import { z } from 'zod';

export const testimonialCreateValidation = z.object({
  quote: z.string().min(1, 'Quote is required'),
  authorName: z.string().min(1, 'Author name is required'),
  authorProfession: z.string().min(1, 'Author profession is required'),
  order: z.number().int().min(0).default(0),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const testimonialUpdateValidation = z.object({
  quote: z.string().min(1).optional(),
  authorName: z.string().min(1).optional(),
  authorProfession: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

