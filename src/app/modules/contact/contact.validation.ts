import { z } from 'zod';

// Validation for creating a new contact enquiry (public endpoint)
export const contactValidation = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .trim(),
  emailAddress: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  phoneNumber: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .max(200, 'Subject cannot exceed 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message cannot exceed 2000 characters')
    .trim(),
});

