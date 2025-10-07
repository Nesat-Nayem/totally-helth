/**
 * Day Close Report Validation Schemas
 * 
 * Defines Zod validation schemas for day close report operations.
 * Ensures data integrity and proper input validation.
 * 
 * @author API Team
 * @version 1.0.0
 */

import { z } from 'zod';

/**
 * Validation schema for day close report query parameters
 * Supports pagination, filtering, and sorting
 */
export const dayCloseReportQueryValidation = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  date: z.string().optional(),
  status: z.enum(['day-close', 'closed']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['startTime', 'endTime', 'status', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Validation schema for download report parameters
 * Supports multiple export formats and filtering options
 */
export const downloadReportValidation = z.object({
  format: z.enum(['pdf', 'excel', 'csv']).optional().default('csv'),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reportIds: z.string().optional().transform(val => val ? val.split(',') : undefined),
  selectedDays: z.string().optional().transform(val => val ? val.split(',') : undefined),
  includeShiftWise: z.string().optional().transform(val => val === 'false' ? false : true),
  includeDayWise: z.string().optional().transform(val => val === 'false' ? false : true),
  includeThermalReceipt: z.string().optional().transform(val => val === 'false' ? false : true),
});

/**
 * Validation schema for ID parameter
 * Validates MongoDB ObjectId format
 */
export const idValidation = z.object({
  id: z.string().min(1, 'ID is required').regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

/**
 * Validation schema for date parameter
 * Validates date format (YYYY-MM-DD)
 */
export const dateValidation = z.object({
  date: z.string().min(1, 'Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD format'),
});