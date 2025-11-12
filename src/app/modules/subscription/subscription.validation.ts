import { z } from 'zod';

export const subscriptionValidation = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

