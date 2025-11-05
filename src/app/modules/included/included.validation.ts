import { z } from 'zod';

export const includedValidation = z.object({
  meal_type: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS']),
  title: z.string().min(1, 'Title is required'),
  image_url: z.string().min(1, 'Image URL is required'),
  nutrition: z.object({
    calories: z.number().nonnegative('Calories must be >= 0'),
    fat_g: z.number().nonnegative('Fat must be >= 0'),
    carbs_g: z.number().nonnegative('Carbs must be >= 0'),
    protein_g: z.number().nonnegative('Protein must be >= 0'),
  }),
  allergens: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
  order: z.number().optional(),
});

export const includedUpdateValidation = z.object({
  meal_type: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']).optional(),
  title: z.string().min(1, 'Title is required').optional(),
  image_url: z.string().min(1, 'Image URL is required').optional(),
  nutrition: z
    .object({
      calories: z.number().nonnegative('Calories must be >= 0'),
      fat_g: z.number().nonnegative('Fat must be >= 0'),
      carbs_g: z.number().nonnegative('Carbs must be >= 0'),
      protein_g: z.number().nonnegative('Protein must be >= 0'),
    })
    .optional(),
  allergens: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  order: z.number().optional(),
});

