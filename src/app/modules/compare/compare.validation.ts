import { z } from 'zod';

export const compareItemSchema = z.object({
  title: z.string().min(1, 'Item title is required'),
  included: z.boolean(),
});

export const compareCreateValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  banner1: z.string().min(1, 'Banner 1 is required'),
  banner2: z.string().min(1, 'Banner 2 is required'),
  compareItems: z.array(compareItemSchema).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const compareUpdateValidation = z.object({
  title: z.string().min(1).optional(),
  banner1: z.string().min(1).optional(),
  banner2: z.string().min(1).optional(),
  compareItems: z.array(compareItemSchema).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

