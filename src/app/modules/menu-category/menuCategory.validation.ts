import { z } from 'zod';

export const menuCategoryCreateValidation = z.object({
  title: z.string().min(1),
  status: z.enum(['active', 'inactive']).optional(),
});

export const menuCategoryUpdateValidation = menuCategoryCreateValidation.partial();
