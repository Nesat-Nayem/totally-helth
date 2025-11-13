import { z } from 'zod';

const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  logo: z.string().min(1, 'Certification logo is required'),
});

export const aboutUsFoodValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  description: z.string().min(1, 'Description is required'),
  images: z.array(z.string().min(1, 'Image URL is required')).min(1, 'At least one image is required'),
  certifications: z.array(certificationSchema).optional(),
});

export const aboutUsFoodUpdateValidation = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  subtitle: z.string().min(1, 'Subtitle is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  images: z.array(z.string().min(1, 'Image URL is required')).optional(),
  certifications: z.array(certificationSchema).optional(),
});

