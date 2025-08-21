import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().optional(),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
});

export const orderCreateValidation = z.object({
  invoiceNo: z.string().min(1),
  date: z.string().or(z.date()),
  customer: z
    .object({
      id: z.string().optional(),
      name: z.string().min(1),
      phone: z.string().optional(),
    })
    .optional(),
  items: z.array(orderItemSchema).min(1),
  subTotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  paymentMode: z.string().optional(),
  status: z.enum(['paid', 'unpaid']).default('paid').optional(),
});

export const orderUpdateValidation = orderCreateValidation.partial();
