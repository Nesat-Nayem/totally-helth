import { z } from 'zod';

export const moreOptionCreateValidation = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  category: z.enum(['more', 'less', 'without', 'general']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const moreOptionUpdateValidation = moreOptionCreateValidation.partial();
