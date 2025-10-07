import { z } from 'zod';

/**
 * Validation schema for starting a new shift
 * All fields are optional as they can be auto-generated
 * Allows scheduling end time for planned shifts
 */
export const shiftStartValidation = z.object({
  shiftNumber: z.number().min(0).optional(), // Allow 0 for special day-close records
  loginDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  loginTime: z.string().optional(),
  logoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  logoutTime: z.string().optional(),
  loginName: z.string().min(1).max(100).optional(),
  note: z.string().max(500).optional(),
});

/**
 * Validation schema for closing a shift
 * Allows specifying actual logout time/date for accurate shift tracking
 */
export const shiftCloseValidation = z.object({
  denominations: z.object({
    denomination1000: z.number().int().min(0).default(0),
    denomination500: z.number().int().min(0).default(0),
    denomination200: z.number().int().min(0).default(0),
    denomination100: z.number().int().min(0).default(0),
    denomination50: z.number().int().min(0).default(0),
    denomination20: z.number().int().min(0).default(0),
    denomination10: z.number().int().min(0).default(0),
    denomination5: z.number().int().min(0).default(0),
    denomination2: z.number().int().min(0).default(0),
    denomination1: z.number().int().min(0).default(0),
  }),
  logoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  logoutTime: z.string().optional(),
});

/**
 * Validation schema for shift query parameters
 * Used for filtering and pagination
 */
export const shiftQueryValidation = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  status: z.enum(['open', 'closed', 'day-close']).optional(),
  shiftNumber: z.string().regex(/^\d+$/, 'Shift number must be a number').optional(),
});

/**
 * Validation schema for email shift report
 * Requires valid email address
 */
export const emailShiftValidation = z.object({
  email: z.string().email('Valid email address is required').max(255),
});

/**
 * Validation schema for day close action
 * Simple day close - just closes all open shifts for the day
 * Now includes optional denomination for cash reconciliation
 */
export const dayCloseActionValidation = z.object({
  note: z.string().max(500).optional(),
  denomination: z.object({
    denomination1000: z.number().int().min(0).default(0),
    denomination500: z.number().int().min(0).default(0),
    denomination200: z.number().int().min(0).default(0),
    denomination100: z.number().int().min(0).default(0),
    denomination50: z.number().int().min(0).default(0),
    denomination20: z.number().int().min(0).default(0),
    denomination10: z.number().int().min(0).default(0),
    denomination5: z.number().int().min(0).default(0),
    denomination2: z.number().int().min(0).default(0),
    denomination1: z.number().int().min(0).default(0),
  }).optional(),
  denominations: z.object({
    denomination1000: z.number().int().min(0).default(0),
    denomination500: z.number().int().min(0).default(0),
    denomination200: z.number().int().min(0).default(0),
    denomination100: z.number().int().min(0).default(0),
    denomination50: z.number().int().min(0).default(0),
    denomination20: z.number().int().min(0).default(0),
    denomination10: z.number().int().min(0).default(0),
    denomination5: z.number().int().min(0).default(0),
    denomination2: z.number().int().min(0).default(0),
    denomination1: z.number().int().min(0).default(0),
  }).optional(),
});
