"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dayCloseActionValidation = exports.emailShiftValidation = exports.shiftQueryValidation = exports.shiftCloseValidation = exports.shiftStartValidation = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for starting a new shift
 * All fields are optional as they can be auto-generated
 * Allows scheduling end time for planned shifts
 */
exports.shiftStartValidation = zod_1.z.object({
    shiftNumber: zod_1.z.number().min(0).optional(), // Allow 0 for special day-close records
    loginDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    loginTime: zod_1.z.string().optional(),
    logoutDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    logoutTime: zod_1.z.string().optional(),
    loginName: zod_1.z.string().min(1).max(100).optional(),
    note: zod_1.z.string().max(500).optional(),
});
/**
 * Validation schema for closing a shift
 * Allows specifying actual logout time/date for accurate shift tracking
 */
exports.shiftCloseValidation = zod_1.z.object({
    denominations: zod_1.z.object({
        denomination1000: zod_1.z.number().int().min(0).default(0),
        denomination500: zod_1.z.number().int().min(0).default(0),
        denomination200: zod_1.z.number().int().min(0).default(0),
        denomination100: zod_1.z.number().int().min(0).default(0),
        denomination50: zod_1.z.number().int().min(0).default(0),
        denomination20: zod_1.z.number().int().min(0).default(0),
        denomination10: zod_1.z.number().int().min(0).default(0),
        denomination5: zod_1.z.number().int().min(0).default(0),
        denomination2: zod_1.z.number().int().min(0).default(0),
        denomination1: zod_1.z.number().int().min(0).default(0),
    }),
    logoutDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    logoutTime: zod_1.z.string().optional(),
});
/**
 * Validation schema for shift query parameters
 * Used for filtering and pagination
 */
exports.shiftQueryValidation = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: zod_1.z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    status: zod_1.z.enum(['open', 'closed', 'day-close']).optional(),
    shiftNumber: zod_1.z.string().regex(/^\d+$/, 'Shift number must be a number').optional(),
});
/**
 * Validation schema for email shift report
 * Requires valid email address
 */
exports.emailShiftValidation = zod_1.z.object({
    email: zod_1.z.string().email('Valid email address is required').max(255),
});
/**
 * Validation schema for day close action
 * Simple day close - just closes all open shifts for the day
 * Now includes optional denomination for cash reconciliation
 */
exports.dayCloseActionValidation = zod_1.z.object({
    note: zod_1.z.string().max(500).optional(),
    denomination: zod_1.z.object({
        denomination1000: zod_1.z.number().int().min(0).default(0),
        denomination500: zod_1.z.number().int().min(0).default(0),
        denomination200: zod_1.z.number().int().min(0).default(0),
        denomination100: zod_1.z.number().int().min(0).default(0),
        denomination50: zod_1.z.number().int().min(0).default(0),
        denomination20: zod_1.z.number().int().min(0).default(0),
        denomination10: zod_1.z.number().int().min(0).default(0),
        denomination5: zod_1.z.number().int().min(0).default(0),
        denomination2: zod_1.z.number().int().min(0).default(0),
        denomination1: zod_1.z.number().int().min(0).default(0),
    }).optional(),
    denominations: zod_1.z.object({
        denomination1000: zod_1.z.number().int().min(0).default(0),
        denomination500: zod_1.z.number().int().min(0).default(0),
        denomination200: zod_1.z.number().int().min(0).default(0),
        denomination100: zod_1.z.number().int().min(0).default(0),
        denomination50: zod_1.z.number().int().min(0).default(0),
        denomination20: zod_1.z.number().int().min(0).default(0),
        denomination10: zod_1.z.number().int().min(0).default(0),
        denomination5: zod_1.z.number().int().min(0).default(0),
        denomination2: zod_1.z.number().int().min(0).default(0),
        denomination1: zod_1.z.number().int().min(0).default(0),
    }).optional(),
});
