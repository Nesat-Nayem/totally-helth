import { z } from 'zod';

export const expenseCreateValidation = z.object({
  invoiceId: z.string().min(1),
  invoiceDate: z.string().or(z.date()),
  expenseType: z.string().min(1),
  description: z.string().optional(),
  supplier: z.string().min(1),
  paymentMethod: z.string().min(1),
  paymentReferenceNo: z.string().optional(),
  baseAmount: z.number().min(0),
  taxPercent: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  vatPercent: z.number().min(0).optional(),
  vatAmount: z.number().min(0).optional(),
  grandTotal: z.number().min(0).optional(),
  approvedBy: z.string().min(1),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const expenseUpdateValidation = expenseCreateValidation.partial();

