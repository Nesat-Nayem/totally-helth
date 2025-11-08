import { z } from 'zod';

export const whyChooseCardSchema = z.object({
  icon: z.string().min(1, 'Card icon is required'),
  title: z.string().min(1, 'Card title is required'),
  items: z.array(z.string().min(1)).min(1, 'Card items array must contain at least one item'),
});

export const whyChooseCreateValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  subTitle: z.string().min(1, 'Subtitle is required'),
  card1: whyChooseCardSchema,
  card2: whyChooseCardSchema,
  card3: whyChooseCardSchema,
  status: z.enum(['active', 'inactive']).default('active'),
});

export const whyChooseUpdateValidation = z.object({
  title: z.string().min(1).optional(),
  subTitle: z.string().min(1).optional(),
  card1: whyChooseCardSchema.optional(),
  card2: whyChooseCardSchema.optional(),
  card3: whyChooseCardSchema.optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

