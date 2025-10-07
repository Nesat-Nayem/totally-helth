import { z } from 'zod';

export const moreOptionCreateValidation = z.object({
  name: z.string().min(1),
  category: z.enum(['more', 'less', 'without', 'general']),
  status: z.enum(['active', 'inactive']),
});

export const moreOptionUpdateValidation = moreOptionCreateValidation.partial();
