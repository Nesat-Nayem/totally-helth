import { z } from 'zod';

export const aggregatorCreateValidation = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const aggregatorUpdateValidation = aggregatorCreateValidation.partial();
