import { z } from 'zod';

export const customerCreateValidation = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const customerUpdateValidation = customerCreateValidation.partial();
