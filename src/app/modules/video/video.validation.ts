import { z } from 'zod';

export const videoValidation = z.object({
  brandLogo: z.string().optional().or(z.literal('')),
  videoUrl: z.string().min(1, 'Video URL is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});
