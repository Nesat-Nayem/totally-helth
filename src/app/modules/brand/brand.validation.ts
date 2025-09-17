import { z } from 'zod';

export const brandCreateValidation = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const brandUpdateValidation = brandCreateValidation.partial();
