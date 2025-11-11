import { z } from 'zod';

export const mealPlanWorkStepSchema = z.object({
  title: z.string().min(1, 'Step title is required'),
  subTitle: z.string().min(1, 'Step subtitle is required'),
});

export const mealPlanWorkCreateValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  banner1: z.string().min(1, 'Banner 1 is required'),
  banner2: z.string().min(1, 'Banner 2 is required'),
  step1: mealPlanWorkStepSchema,
  step2: mealPlanWorkStepSchema,
  step3: mealPlanWorkStepSchema,
  metaTitle: z.string().min(1, 'Meta title is required'),
  metaTagKeyword: z.string().min(1, 'Meta tag keyword is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const mealPlanWorkUpdateValidation = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  banner1: z.string().min(1).optional(),
  banner2: z.string().min(1).optional(),
  step1: mealPlanWorkStepSchema.optional(),
  step2: mealPlanWorkStepSchema.optional(),
  step3: mealPlanWorkStepSchema.optional(),
  metaTitle: z.string().min(1).optional(),
  metaTagKeyword: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

