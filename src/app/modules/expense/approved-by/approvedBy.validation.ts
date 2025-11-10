import { z } from 'zod';

export const approvedByCreateValidation = z.object({
  name: z.string().min(1),
  status: z.enum(['active', 'inactive']).optional(),
});

export const approvedByUpdateValidation = approvedByCreateValidation.partial();

