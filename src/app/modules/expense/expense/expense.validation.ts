import { z } from 'zod';

// Helper to coerce string numbers to numbers
const numberCoerce = z.coerce.number().min(0);

// Helper to validate ObjectId (string with min length 1, optionally validate format)
const objectIdValidation = z.string().min(1);

export const expenseCreateValidation = z.object({
  invoiceId: z.string().min(1),
  invoiceDate: z.string().or(z.date()),
  expenseType: objectIdValidation,
  description: z.string().optional().or(z.literal('')),
  supplier: objectIdValidation,
  paymentMethod: z.string().min(1),
  paymentReferenceNo: z.string().optional().or(z.literal('')),
  baseAmount: numberCoerce,
  taxPercent: numberCoerce.optional(),
  taxAmount: numberCoerce.optional(),
  vatPercent: numberCoerce.optional(),
  vatAmount: numberCoerce.optional(),
  grandTotal: numberCoerce.optional(),
  approvedBy: objectIdValidation,
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
});

export const expenseUpdateValidation = z.object({
  invoiceId: z.string().min(1).optional(),
  invoiceDate: z.string().or(z.date()).optional(),
  expenseType: objectIdValidation.optional(),
  description: z.string().optional().or(z.literal('')),
  supplier: objectIdValidation.optional(),
  paymentMethod: z.string().min(1).optional(),
  paymentReferenceNo: z.string().optional().or(z.literal('')),
  baseAmount: numberCoerce.optional(),
  taxPercent: numberCoerce.optional(),
  taxAmount: numberCoerce.optional(),
  vatPercent: numberCoerce.optional(),
  vatAmount: numberCoerce.optional(),
  grandTotal: numberCoerce.optional(),
  approvedBy: objectIdValidation.optional(),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
});

