"use strict";
/**
 * Day Close Report Validation Schemas
 *
 * Defines Zod validation schemas for day close report operations.
 * Ensures data integrity and proper input validation.
 *
 * @author API Team
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateValidation = exports.idValidation = exports.downloadReportValidation = exports.dayCloseReportQueryValidation = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for day close report query parameters
 * Supports pagination, filtering, and sorting
 */
exports.dayCloseReportQueryValidation = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
    date: zod_1.z.string().optional(),
    status: zod_1.z.enum(['day-close', 'closed']).optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['startTime', 'endTime', 'status', 'createdAt']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
/**
 * Validation schema for download report parameters
 * Supports multiple export formats and filtering options
 */
exports.downloadReportValidation = zod_1.z.object({
    format: zod_1.z.enum(['pdf', 'excel', 'csv']).optional().default('csv'),
    date: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    reportIds: zod_1.z.string().optional().transform(val => val ? val.split(',') : undefined),
    selectedDays: zod_1.z.string().optional().transform(val => val ? val.split(',') : undefined),
    includeShiftWise: zod_1.z.string().optional().transform(val => val === 'false' ? false : true),
    includeDayWise: zod_1.z.string().optional().transform(val => val === 'false' ? false : true),
    includeThermalReceipt: zod_1.z.string().optional().transform(val => val === 'false' ? false : true),
});
/**
 * Validation schema for ID parameter
 * Validates MongoDB ObjectId format
 */
exports.idValidation = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required').regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});
/**
 * Validation schema for date parameter
 * Validates date format (YYYY-MM-DD)
 */
exports.dateValidation = zod_1.z.object({
    date: zod_1.z.string().min(1, 'Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD format'),
});
