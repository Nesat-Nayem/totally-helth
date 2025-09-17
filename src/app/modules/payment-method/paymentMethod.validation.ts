import { z } from 'zod';

export const paymentMethodCreateValidation = z.object({
  name: z.string().min(1),
  status: z.enum(['active', 'inactive']).optional(),
});

export const paymentMethodUpdateValidation = paymentMethodCreateValidation.partial();
