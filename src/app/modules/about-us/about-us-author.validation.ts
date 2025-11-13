import { z } from 'zod';

export const aboutUsAuthorValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  image: z.string().min(1, 'Image is required'),
  description: z.string().min(1, 'Description is required'),
});

export const aboutUsAuthorUpdateValidation = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  designation: z.string().min(1, 'Designation is required').optional(),
  image: z.string().min(1, 'Image is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
});

