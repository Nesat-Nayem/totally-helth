import { z } from 'zod';

export const branchCreateValidation = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().optional(),
  brand: z.string().optional(),
  logo: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const branchUpdateValidation = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  brand: z.string().optional(),
  logo: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
