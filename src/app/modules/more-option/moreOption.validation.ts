import { z } from 'zod';

export const moreOptionCreateValidation = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  status: z.enum(['active', 'inactive']).optional(),
});

export const moreOptionUpdateValidation = moreOptionCreateValidation.partial();
