import { z } from 'zod';

export const bannerValidation = z.object({
  title: z.string().min(1, 'Banner title is required'),
  image: z.string().min(1, 'Banner image is required'),
  certLogo: z.string().min(1, 'Certification logo is required'),
  description: z.string().min(1, 'Description is required'),
  metaTitle: z.string().min(1, 'Meta title is required'),
  metaDescription: z.string().min(1, 'Meta description is required'),
  metaKeywords: z.string().min(1, 'Meta keywords are required'),
  googleReviewCount: z.number().int().nonnegative('Count must be >= 0'),
  status: z.enum(['active', 'inactive']).default('active'),
  order: z.number().optional(),
});

export const bannerUpdateValidation = z.object({
  title: z.string().min(1, 'Banner title is required').optional(),
  image: z.string().min(1, 'Banner image is required').optional(),
  certLogo: z.string().min(1, 'Certification logo is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  metaTitle: z.string().min(1, 'Meta title is required').optional(),
  metaDescription: z.string().min(1, 'Meta description is required').optional(),
  metaKeywords: z.string().min(1, 'Meta keywords are required').optional(),
  googleReviewCount: z.number().int().nonnegative('Count must be >= 0').optional(),
  status: z.enum(['active', 'inactive']).optional(),
  order: z.number().optional(),
});


