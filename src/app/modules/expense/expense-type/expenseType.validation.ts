import { z } from 'zod';

export const expenseTypeCreateValidation = z.object({
  name: z.string().min(1),
  status: z.enum(['active', 'inactive']).optional(),
});

export const expenseTypeUpdateValidation = expenseTypeCreateValidation.partial();

