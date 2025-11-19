import { z } from 'zod';

export const getInTouchValidation = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .trim(),
  officeAddress: z
    .string()
    .min(1, 'Office address is required')
    .trim(),
  contactNumbers: z
    .array(z.string().min(1, 'Contact number cannot be empty'))
    .min(1, 'At least one contact number is required'),
  emailAddresses: z
    .array(z.string().email('Invalid email address').toLowerCase().trim())
    .min(1, 'At least one email address is required'),
  careerInfo: z
    .string()
    .min(1, 'Career info is required')
    .trim(),
});

