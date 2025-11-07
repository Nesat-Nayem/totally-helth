import { z } from 'zod';

export const goalSectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  icon: z.string().min(1, 'Section icon is required'),
  description: z.string().min(1, 'Section description is required'),
});

export const goalCreateValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  sections: z.array(goalSectionSchema).min(1).max(3),
  metaTitle: z.string().min(1, 'Meta title is required'),
  metaDescription: z.string().min(1, 'Meta description is required'),
  metaKeywords: z.string().min(1, 'Meta keywords are required'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const goalUpdateValidation = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  sections: z.array(goalSectionSchema).min(1).max(3).optional(),
  metaTitle: z.string().min(1).optional(),
  metaDescription: z.string().min(1).optional(),
  metaKeywords: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
