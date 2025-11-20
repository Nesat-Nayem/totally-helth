import { z } from 'zod';

const serviceSchema = z.object({
  title: z.string().min(1, 'Service title is required'),
  description: z.string().min(1, 'Service description is required'),
}).passthrough(); // Allow additional fields like _id

export const aboutUsDetailsValidation = z.object({
  image: z.string().min(1, 'Image is required'),
  headline: z.string().min(1, 'Headline is required'),
  description: z.string().min(1, 'Description is required'),
  services: z.array(serviceSchema).optional().default([]),
}).passthrough();

export const aboutUsDetailsUpdateValidation = z.object({
  image: z.string().min(1, 'Image is required').optional(),
  headline: z.string().min(1, 'Headline is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  services: z.array(serviceSchema).optional(),
}).passthrough();

