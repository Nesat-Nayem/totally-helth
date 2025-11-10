import { z } from 'zod';

export const supplierCreateValidation = z.object({
  name: z.string().min(1),
  status: z.enum(['active', 'inactive']).optional(),
});

export const supplierUpdateValidation = supplierCreateValidation.partial();

