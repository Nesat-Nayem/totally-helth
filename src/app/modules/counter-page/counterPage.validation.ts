import { z } from 'zod';

export const counterPageValidation = z.object({
  totalReviews: z.number().min(0, 'Total reviews must be a positive number'),
  totalMealItems: z.number().min(0, 'Total meal items must be a positive number'),
  happyClients: z.number().min(0, 'Happy clients must be a positive number'),
  yearsHelpingPeople: z.number().min(0, 'Years helping people must be a positive number'),
});

export const counterPageUpdateValidation = z.object({
  totalReviews: z.number().min(0).optional(),
  totalMealItems: z.number().min(0).optional(),
  happyClients: z.number().min(0).optional(),
  yearsHelpingPeople: z.number().min(0).optional(),
});

