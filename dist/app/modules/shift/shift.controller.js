"use strict";
/**
 * Shift Management Controller
 *
 * Handles shift operations including opening, closing, and day close functionality.
 * Manages cash denominations and provides comprehensive shift tracking.
 *
 * @author API Team
 * @version 1.0.0
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShiftById = exports.getShifts = exports.getOpenShift = exports.dayClose = exports.closeShift = exports.openShift = void 0;
const shift_model_1 = require("./shift.model");
const shift_validation_1 = require("./shift.validation");
const sales_service_1 = require("./sales.service");
const day_close_model_1 = require("../day-close-report/day-close.model");
const day_sales_model_1 = require("../day-close-report/day-sales.model");
const auth_model_1 = require("../auth/auth.model");
// Default timezone for date operations
const DEFAULT_TIMEZONE = 'Asia/Dubai';
/**
 * Populates user details (name, email, phone) based on user ID
 * @param userId - User ID to fetch details for
 * @returns User details object or null if not found
 */
const populateUserDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId)
        return null;
    try {
        const user = yield auth_model_1.User.findById(userId).select('name email phone').lean();
        return user ? {
            name: user.name,
            email: user.email,
            phone: user.phone
        } : null;
    }
    catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
});
/**
 * Formats a date to YYYY-MM-DD format in specified timezone
 * @param date - Date to format
 * @param timezone - Timezone to use (defaults to Asia/Dubai)
 * @returns Formatted date string
 */
const formatYMD = (date, timezone = DEFAULT_TIMEZONE) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const lookup = {};
    for (const part of parts) {
        if (part.type !== 'literal')
            lookup[part.type] = part.value;
    }
    return `${lookup.year}-${lookup.month}-${lookup.day}`;
};
/**
 * Ensures a valid date object from various input types
 * @param value - Date value to validate
 * @returns Valid Date object
 * @throws Error if date is invalid
 */
const ensureDate = (value) => {
    if (!value)
        return new Date();
    const dt = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dt.getTime())) {
        throw new Error('Invalid date value');
    }
    return dt;
};
/**
 * Handles timezone-aware date calculations for overnight shifts
 * @param startTime - Start time of the shift
 * @param endTime - End time of the shift
 * @param timezone - Timezone to use for calculations
 * @returns Object with startDate, endDate, and whether it spans multiple days
 */
const calculateShiftDates = (startTime, endTime, timezone = DEFAULT_TIMEZONE) => {
    const startDate = formatYMD(startTime, timezone);
    const endDate = formatYMD(endTime, timezone);
    // Check if shift spans multiple days
    const spansMultipleDays = startDate !== endDate;
    return {
        startDate,
        endDate,
        spansMultipleDays,
        // For overnight shifts, the business day is the start date
        businessDate: startDate
    };
};
/**
 * Checks if day close has been performed for a specific date
 * @param date - Date to check (YYYY-MM-DD format)
 * @param branchId - Branch ID to check
 * @returns Promise<boolean> - True if day close has been performed
 */
const isDayClosed = (date, branchId) => __awaiter(void 0, void 0, void 0, function* () {
    const dayClosedShift = yield shift_model_1.Shift.findOne(Object.assign({ status: 'day-close', startDate: date }, (branchId ? { branchId } : {})));
    return !!dayClosedShift;
});
/**
 * Serializes a shift document for API response
 * @param doc - Shift document to serialize
 * @param createdByDetails - User details for createdBy
 * @param closedByDetails - User details for closedBy
 * @returns Serialized shift object with ISO date strings and user details
 */
const serializeShift = (doc, createdByDetails, closedByDetails) => {
    if (!doc)
        return doc;
    const obj = typeof doc.toObject === 'function'
        ? doc.toObject({ versionKey: false })
        : Object.assign({}, doc);
    // Convert dates to ISO strings
    if (obj.startTime instanceof Date)
        obj.startTime = obj.startTime.toISOString();
    if (obj.endTime instanceof Date)
        obj.endTime = obj.endTime.toISOString();
    if (obj.logoutTime instanceof Date)
        obj.logoutTime = obj.logoutTime.toISOString();
    obj.createdAt = obj.createdAt instanceof Date ? obj.createdAt.toISOString() : obj.createdAt;
    obj.updatedAt = obj.updatedAt instanceof Date ? obj.updatedAt.toISOString() : obj.updatedAt;
    // Add user details if available
    if (createdByDetails) {
        obj.createdByDetails = createdByDetails;
    }
    if (closedByDetails) {
        obj.closedByDetails = closedByDetails;
    }
    return obj;
};
/**
 * Calculates total cash value from denomination counts
 * @param denominations - Object containing denomination counts
 * @returns Total cash value
 */
const calculateDenominationTotal = (denominations) => {
    if (!denominations)
        return 0;
    const values = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
    const counts = [
        denominations.denomination1000 || 0,
        denominations.denomination500 || 0,
        denominations.denomination200 || 0,
        denominations.denomination100 || 0,
        denominations.denomination50 || 0,
        denominations.denomination20 || 0,
        denominations.denomination10 || 0,
        denominations.denomination5 || 0,
        denominations.denomination2 || 0,
        denominations.denomination1 || 0,
    ];
    return values.reduce((total, value, index) => total + (value * counts[index]), 0);
};
/**
 * Creates denomination object with default values
 * @param denominationData - Optional denomination data from request
 * @returns Denomination object with calculated total cash
 */
const createDenominationData = (denominationData) => {
    const denomination = {
        denomination1000: (denominationData === null || denominationData === void 0 ? void 0 : denominationData.denomination1000) || 0,
        denomination500: (denominationData === null || denominationData === void 0 ? void 0 : denominationData.denomination500) || 0,
        denomination200: (denominationData === null || denominationData === void 0 ? void 0 : denominationData.denomination200) || 0,
        denomination100: (denominationData === null || denominationData === void 0 ? void 0 : denominationData.denomination100) || 0,
        denomination50: (denominationData === null || denominationData === void 0 ? void 0 : denominationData.denomination50) || 0,
        denomination20: (denominationData === null || denominationData === void 0 ? void 0 : denominationData.denomination20) || 0,
        denomination10: (denominationData === null || denominationData === void 0 ? void 0 : denominationData.denomination10) || 0,
        denomination5: (denominationData === null || denominationData === void 0 ? void 0 : denominationData.denomination5) || 0,
        denomination2: (denominationData === null || denominationData === void 0 ? void 0 : denominationData.denomination2) || 0,
        denomination1: (denominationData === null || denominationData === void 0 ? void 0 : denominationData.denomination1) || 0,
        totalCash: 0
    };
    denomination.totalCash = calculateDenominationTotal(denomination);
    return denomination;
};
/**
 * Initializes denominations object with zero values
 * @returns Object with all denomination fields set to 0
 */
const initializeDenominations = () => ({
    denomination1000: 0,
    denomination500: 0,
    denomination200: 0,
    denomination100: 0,
    denomination50: 0,
    denomination20: 0,
    denomination10: 0,
    denomination5: 0,
    denomination2: 0,
    denomination1: 0,
    totalCash: 0
});
/**
 * Parses date and time strings into a Date object
 * Supports both 12-hour (AM/PM) and 24-hour formats
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timeStr - Time string (12-hour or 24-hour format)
 * @returns Parsed Date object
 * @throws Error if parsing fails
 */
const parseDateTime = (dateStr, timeStr) => {
    try {
        let hour24 = 0;
        let minute = 0;
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes] = time.split(':');
            hour24 = parseInt(hours);
            minute = parseInt(minutes);
            if (period === 'PM' && hour24 !== 12) {
                hour24 += 12;
            }
            else if (period === 'AM' && hour24 === 12) {
                hour24 = 0;
            }
        }
        else {
            const [hours, minutes] = timeStr.split(':');
            hour24 = parseInt(hours);
            minute = parseInt(minutes);
        }
        // COMPLETELY DIFFERENT APPROACH: Use manual UTC calculation
        // For IST (UTC+5:30), we need to subtract 5 hours 30 minutes from local time
        // This is a hardcoded approach that should work for IST timezone
        // Create the date string in UTC format directly
        const utcHour = hour24 - 5; // Subtract 5 hours for IST
        const utcMinute = minute - 30; // Subtract 30 minutes for IST
        // Handle negative minutes
        let finalHour = utcHour;
        let finalMinute = utcMinute;
        if (utcMinute < 0) {
            finalHour = utcHour - 1;
            finalMinute = 60 + utcMinute;
        }
        // Handle negative hours
        if (finalHour < 0) {
            finalHour = 24 + finalHour;
        }
        // Create UTC date string
        const utcDateString = `${dateStr}T${finalHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}:00.000Z`;
        const utcDate = new Date(utcDateString);
        if (isNaN(utcDate.getTime())) {
            throw new Error(`Invalid date format: ${dateStr} ${timeStr}`);
        }
        return utcDate;
    }
    catch (error) {
        throw new Error(`Invalid date value: ${dateStr} ${timeStr}`);
    }
};
/**
 * Starts a new shift
 * @param req - Express request object
 * @param res - Express response object
 */
const openShift = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = shift_validation_1.shiftStartValidation.parse(req.body || {});
        const reqUser = req;
        const branchId = reqUser.branchId;
        const userId = (_b = (_a = reqUser.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
        const timezone = reqUser.timezone || DEFAULT_TIMEZONE;
        // Get current date in user's timezone
        const currentDate = payload.loginDate || formatYMD(new Date(), timezone);
        // Check if day close has been performed for the current date
        if (yield isDayClosed(currentDate, branchId)) {
            const dayClosedShift = yield shift_model_1.Shift.findOne(Object.assign({ status: 'day-close', startDate: currentDate }, (branchId ? { branchId } : {})));
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Day close has been performed for today. New shifts can only be started from tomorrow onwards.',
                dayCloseTime: dayClosedShift === null || dayClosedShift === void 0 ? void 0 : dayClosedShift.endTime,
                closedBy: dayClosedShift === null || dayClosedShift === void 0 ? void 0 : dayClosedShift.closedBy
            });
            return;
        }
        // Check if there's already an open shift for this branch
        const existing = yield shift_model_1.Shift.findOne(Object.assign({ status: 'open' }, (branchId ? { branchId } : {})));
        if (existing) {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'An open shift already exists',
                data: serializeShift(existing)
            });
            return;
        }
        // Get the next shift number for this branch and date
        const startDate = payload.loginDate || formatYMD(new Date());
        const lastShift = yield shift_model_1.Shift.findOne(Object.assign({ startDate: startDate }, (branchId ? { branchId } : {})))
            .sort({ shiftNumber: -1 })
            .lean();
        const nextShiftNumber = ((lastShift === null || lastShift === void 0 ? void 0 : lastShift.shiftNumber) || 0) + 1;
        // Handle date parsing with error handling
        let startTime = new Date();
        if (payload.loginTime) {
            const dateStr = startDate;
            const timeStr = payload.loginTime;
            startTime = parseDateTime(dateStr, timeStr);
        }
        let endTime = undefined;
        let endDate = undefined;
        // Handle scheduled end time if provided
        if (payload.logoutTime && payload.logoutDate) {
            // Use provided scheduled end time and date
            endTime = parseDateTime(payload.logoutDate, payload.logoutTime);
            endDate = payload.logoutDate;
        }
        else if (payload.logoutTime) {
            // Use provided scheduled end time with start date
            endTime = parseDateTime(startDate, payload.logoutTime);
            endDate = startDate;
        }
        // If no logout time provided, endTime and endDate remain undefined (open-ended shift)
        const shift = yield shift_model_1.Shift.create({
            shiftNumber: nextShiftNumber,
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
            branchId,
            createdBy: userId,
            note: payload.note,
            loginName: payload.loginName || 'CASH',
            logoutTime: endTime,
            denominations: initializeDenominations()
        });
        // Get user details for createdBy
        const createdByDetails = yield populateUserDetails(userId);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Shift started',
            data: serializeShift(shift, createdByDetails)
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to start shift'
        });
    }
});
exports.openShift = openShift;
/**
 * Closes the current shift with cash denominations
 * @param req - Express request object
 * @param res - Express response object
 */
const closeShift = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payload = shift_validation_1.shiftCloseValidation.parse(req.body || {});
        const reqUser = req;
        const userId = (_b = (_a = reqUser.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
        const branchId = reqUser.branchId;
        const timezone = reqUser.timezone || DEFAULT_TIMEZONE;
        // Find the open shift for this branch
        const shift = yield shift_model_1.Shift.findOne(Object.assign({ status: 'open' }, (branchId ? { branchId } : {})));
        if (!shift) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'No open shift found to close'
            });
            return;
        }
        // Check if shift has scheduled end time and if we're closing early
        const now = new Date();
        const originalScheduledEndTime = shift.endTime; // Store original scheduled time
        const isEarlyClosing = originalScheduledEndTime && originalScheduledEndTime > now;
        if (isEarlyClosing && originalScheduledEndTime) {
            // Allow early closing but warn the user
            const scheduledEndDate = formatYMD(originalScheduledEndTime, timezone);
            const scheduledEndTime = originalScheduledEndTime.toLocaleTimeString('en-US', {
                hour12: false,
                timeZone: timezone
            });
            // You can choose to either:
            // 1. Allow early closing with warning (current behavior)
            // 2. Prevent early closing (uncomment the return statement below)
            // Uncomment these lines to prevent early closing:
            // res.status(400).json({
            //   success: false,
            //   statusCode: 400,
            //   message: `Cannot close shift early. Scheduled end time is ${scheduledEndDate} at ${scheduledEndTime}`,
            //   scheduledEndDate,
            //   scheduledEndTime
            // });
            // return;
        }
        // Set status and close info
        shift.status = 'closed';
        shift.closedBy = userId;
        // Determine logout time and date
        let logoutTime;
        let logoutDate;
        if (payload.logoutTime && payload.logoutDate) {
            // Use provided logout time and date (for backdating or rescheduling)
            logoutTime = parseDateTime(payload.logoutDate, payload.logoutTime);
            logoutDate = payload.logoutDate;
        }
        else if (payload.logoutTime) {
            // Use provided logout time with current date
            const currentDate = formatYMD(new Date(), timezone);
            logoutTime = parseDateTime(currentDate, payload.logoutTime);
            logoutDate = currentDate;
        }
        else {
            // Use current time as fallback (early closing or on-time closing)
            logoutTime = new Date();
            logoutDate = formatYMD(logoutTime, timezone);
        }
        // Update end time and date
        shift.endTime = logoutTime;
        shift.endDate = logoutDate;
        shift.logoutTime = logoutTime;
        // Handle denominations
        if (payload.denominations) {
            const totalCash = calculateDenominationTotal(payload.denominations);
            shift.denominations = Object.assign(Object.assign({}, payload.denominations), { totalCash: totalCash });
        }
        else {
            // Ensure denominations are initialized if not provided
            if (!shift.denominations) {
                shift.denominations = initializeDenominations();
            }
        }
        // Calculate and store sales data for this shift
        try {
            const salesData = yield (0, sales_service_1.calculateSales)(shift.startTime, logoutTime, branchId);
            shift.sales = salesData;
        }
        catch (error) {
            console.error('❌ Error calculating sales:', error);
        }
        yield shift.save();
        // Get user details for createdBy and closedBy
        const createdByDetails = yield populateUserDetails(shift.createdBy);
        const closedByDetails = yield populateUserDetails(userId);
        // Prepare response message
        let message = 'Shift closed successfully';
        let warning = null;
        if (isEarlyClosing && originalScheduledEndTime) {
            const scheduledEndDate = formatYMD(originalScheduledEndTime, timezone);
            const scheduledEndTime = originalScheduledEndTime.toLocaleTimeString('en-US', {
                hour12: false,
                timeZone: timezone
            });
            message = 'Shift closed early';
            warning = `Scheduled end time was ${scheduledEndDate} at ${scheduledEndTime}`;
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message,
            warning,
            data: serializeShift(shift, createdByDetails, closedByDetails)
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to close shift'
        });
    }
});
exports.closeShift = closeShift;
/**
 * Performs day close - closes all open shifts for the current day
 * If no shifts exist, creates a day-close record for the whole day
 * @param req - Express request object
 * @param res - Express response object
 */
const dayClose = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const payload = shift_validation_1.dayCloseActionValidation.parse(req.body || {});
        const reqUser = req;
        const userId = (_b = (_a = reqUser.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
        const branchId = reqUser.branchId;
        const timezone = reqUser.timezone || DEFAULT_TIMEZONE;
        // Get current date in user's timezone
        const currentDate = formatYMD(new Date(), timezone);
        const now = new Date();
        // Check if day close has already been performed for this date
        const existingDayClose = yield day_close_model_1.DayClose.findOne(Object.assign({ status: 'day-close', startDate: currentDate }, (branchId ? { branchId } : {})));
        if (existingDayClose) {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Day close has already been performed for this date',
                existingDayClose: {
                    id: existingDayClose._id,
                    startDate: existingDayClose.startDate,
                    endTime: existingDayClose.endTime,
                    closedBy: existingDayClose.closedBy,
                    note: existingDayClose.note
                }
            });
            return;
        }
        // Check if any shifts already have day-close status for this date
        const existingDayCloseShifts = yield shift_model_1.Shift.find(Object.assign({ startDate: currentDate, status: 'day-close' }, (branchId ? { branchId } : {})));
        if (existingDayCloseShifts.length > 0) {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Day close has already been performed for this date',
                existingDayCloseShifts: existingDayCloseShifts.map(shift => ({
                    id: shift._id,
                    shiftNumber: shift.shiftNumber,
                    startDate: shift.startDate,
                    endTime: shift.endTime,
                    closedBy: shift.closedBy,
                    note: shift.note
                }))
            });
            return;
        }
        // Find all open shifts for the current day
        const shiftsToClose = yield shift_model_1.Shift.find(Object.assign({ startDate: currentDate, status: { $in: ['open', 'closed'] } }, (branchId ? { branchId } : {})));
        // If no shifts exist, create only DayClose record (no shift records)
        if (shiftsToClose.length === 0) {
            // Calculate day sales data for the whole day
            let daySalesData = null;
            try {
                const startOfDay = new Date(currentDate + 'T00:00:00.000Z');
                const endOfDay = new Date(currentDate + 'T23:59:59.999Z');
                daySalesData = yield (0, sales_service_1.calculateSales)(startOfDay, endOfDay, branchId);
            }
            catch (error) {
                console.error('❌ Error calculating day sales:', error);
            }
            // Create DayClose record for the whole day (no shift records needed)
            try {
                const dayCloseRecord = new day_close_model_1.DayClose({
                    startDate: currentDate,
                    startTime: new Date(currentDate + 'T00:00:00.000Z'),
                    endDate: currentDate,
                    endTime: now,
                    status: 'day-close',
                    branchId: branchId,
                    createdBy: userId,
                    closedBy: userId,
                    note: payload.note || 'Day close completed for whole day (no shifts)'
                });
                yield dayCloseRecord.save();
            }
            catch (error) {
                console.error('❌ Error saving day close record:', error);
            }
            // Save day sales data to DaySales schema
            try {
                const daySalesRecord = new day_sales_model_1.DaySales({
                    date: currentDate,
                    branchId: branchId,
                    daySales: daySalesData || {
                        totalOrders: 0,
                        totalSales: 0,
                        payments: { cash: 0, card: 0, online: 0 }
                    },
                    shiftWiseSales: {
                        totalOrders: 0,
                        totalSales: 0,
                        payments: { cash: 0, card: 0, online: 0 }
                    },
                    shifts: [],
                    totalShifts: 0,
                    dayCloseTime: now,
                    closedBy: userId,
                    denomination: createDenominationData(payload.denomination)
                });
                yield daySalesRecord.save();
            }
            catch (error) {
                console.error('❌ Error saving day sales data:', error);
            }
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Day close completed successfully for whole day (no shifts found)',
                data: [], // No shift data when no shifts exist
                closedCount: 0, // No shifts were closed
                dayCloseTime: now.toISOString(),
                closedBy: userId,
                daySales: daySalesData,
                summary: {
                    dayWise: {
                        totalOrders: (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.totalOrders) || 0,
                        totalSales: (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.totalSales) || 0,
                        description: "All orders for the entire day (no shifts)"
                    },
                    shiftWise: {
                        totalOrders: 0,
                        totalSales: 0,
                        description: "No shifts found for today"
                    }
                }
            });
            return;
        }
        // Calculate day sales data
        let daySalesData = null;
        try {
            const startOfDay = new Date(currentDate + 'T00:00:00.000Z');
            const endOfDay = new Date(currentDate + 'T23:59:59.999Z');
            daySalesData = yield (0, sales_service_1.calculateSales)(startOfDay, endOfDay, branchId);
        }
        catch (error) {
            console.error('❌ Error calculating day sales:', error);
        }
        // Calculate shift-wise totals
        const shiftWiseTotals = {
            totalShifts: shiftsToClose.length,
            totalOrders: 0,
            totalSales: 0,
            totalPayments: {
                cash: 0,
                card: 0,
                online: 0
            },
            shifts: [] // Array to store IShiftSalesSummary
        };
        // Close all shifts for the current day
        const updatedShifts = [];
        for (const shift of shiftsToClose) {
            shift.status = 'day-close';
            shift.endDate = currentDate;
            shift.endTime = now;
            shift.closedBy = userId;
            shift.logoutTime = now;
            // Add note - use provided note or default
            shift.note = payload.note || 'Day close completed for today';
            // If this shift doesn't have sales data, calculate it
            if (!shift.sales) {
                try {
                    const salesData = yield (0, sales_service_1.calculateSales)(shift.startTime, now, branchId);
                    shift.sales = salesData;
                }
                catch (error) {
                    console.error('❌ Error calculating sales during day close:', error);
                }
            }
            // Add to shift-wise totals
            if (shift.sales) {
                shiftWiseTotals.totalOrders += shift.sales.totalOrders || 0;
                shiftWiseTotals.totalSales += shift.sales.totalSales || 0;
                shiftWiseTotals.totalPayments.cash += ((_c = shift.sales.payments) === null || _c === void 0 ? void 0 : _c.cash) || 0;
                shiftWiseTotals.totalPayments.card += ((_d = shift.sales.payments) === null || _d === void 0 ? void 0 : _d.card) || 0;
                shiftWiseTotals.totalPayments.online += ((_e = shift.sales.payments) === null || _e === void 0 ? void 0 : _e.online) || 0;
                shiftWiseTotals.shifts.push({
                    shiftId: shift._id.toString(),
                    shiftNumber: shift.shiftNumber,
                    startTime: shift.startTime,
                    endTime: now, // Use current time as end time for day-closed shifts
                    sales: shift.sales
                });
            }
            yield shift.save();
            // Get user details for createdBy and closedBy
            const createdByDetails = yield populateUserDetails(shift.createdBy);
            const closedByDetails = yield populateUserDetails(userId);
            updatedShifts.push(serializeShift(shift, createdByDetails, closedByDetails));
        }
        // Save day sales data to DaySales schema
        try {
            const daySalesRecord = new day_sales_model_1.DaySales({
                date: currentDate,
                branchId: branchId,
                daySales: daySalesData || {
                    totalOrders: 0,
                    totalSales: 0,
                    payments: { cash: 0, card: 0, online: 0 }
                },
                shiftWiseSales: {
                    totalOrders: shiftWiseTotals.totalOrders,
                    totalSales: shiftWiseTotals.totalSales,
                    payments: shiftWiseTotals.totalPayments
                },
                shifts: shiftWiseTotals.shifts,
                totalShifts: shiftWiseTotals.totalShifts,
                dayCloseTime: now,
                closedBy: userId,
                denomination: createDenominationData(payload.denomination)
            });
            yield daySalesRecord.save();
        }
        catch (error) {
            console.error('❌ Error saving day sales data:', error);
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: `Day close completed successfully. Closed ${updatedShifts.length} shift(s)`,
            data: updatedShifts,
            closedCount: updatedShifts.length,
            dayCloseTime: now.toISOString(),
            closedBy: userId,
            daySales: daySalesData,
            shiftWiseTotals: shiftWiseTotals,
            summary: {
                dayWise: {
                    totalOrders: (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.totalOrders) || 0,
                    totalSales: (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.totalSales) || 0,
                    description: "All orders for the entire day"
                },
                shiftWise: {
                    totalOrders: shiftWiseTotals.totalOrders,
                    totalSales: shiftWiseTotals.totalSales,
                    description: "Orders from closed shifts only"
                }
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to perform day close'
        });
    }
});
exports.dayClose = dayClose;
/**
 * Gets the current open shift
 * @param req - Express request object
 * @param res - Express response object
 */
const getOpenShift = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reqUser = req;
        const branchId = reqUser.branchId;
        const filter = { status: 'open' };
        if (branchId)
            filter.branchId = branchId;
        const shift = yield shift_model_1.Shift.findOne(filter);
        if (shift) {
            // Get user details for createdBy
            const createdByDetails = yield populateUserDetails(shift.createdBy);
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Open shift retrieved successfully',
                data: serializeShift(shift, createdByDetails)
            });
        }
        else {
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'No open shift found',
                data: null
            });
        }
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch open shift'
        });
    }
});
exports.getOpenShift = getOpenShift;
/**
 * Gets all shifts with pagination and filtering
 * @param req - Express request object
 * @param res - Express response object
 */
const getShifts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = shift_validation_1.shiftQueryValidation.parse(req.query || {});
        const reqUser = req;
        const branchId = reqUser.branchId;
        const page = Math.max(1, parseInt(query.page || '1', 10));
        const limit = Math.max(1, Math.min(50, parseInt(query.limit || '20', 10)));
        const skip = (page - 1) * limit;
        const filter = {};
        if (branchId)
            filter.branchId = branchId;
        if (query.date)
            filter.startDate = query.date;
        if (query.status)
            filter.status = query.status;
        if (query.shiftNumber)
            filter.shiftNumber = parseInt(query.shiftNumber, 10);
        const [items, total] = yield Promise.all([
            shift_model_1.Shift.find(filter).sort({ startTime: -1 }).skip(skip).limit(limit).lean(),
            shift_model_1.Shift.countDocuments(filter),
        ]);
        // Get user details for all shifts
        const serializedItems = yield Promise.all(items.map((shift) => __awaiter(void 0, void 0, void 0, function* () {
            const createdByDetails = yield populateUserDetails(shift.createdBy);
            const closedByDetails = yield populateUserDetails(shift.closedBy);
            return serializeShift(shift, createdByDetails, closedByDetails);
        })));
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Shifts retrieved successfully',
            data: serializedItems,
            meta: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch shifts'
        });
    }
});
exports.getShifts = getShifts;
/**
 * Gets a specific shift by ID
 * @param req - Express request object
 * @param res - Express response object
 */
const getShiftById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const shift = yield shift_model_1.Shift.findById(id);
        if (!shift) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'Shift not found'
            });
            return;
        }
        // Get user details for createdBy and closedBy
        const createdByDetails = yield populateUserDetails(shift.createdBy);
        const closedByDetails = yield populateUserDetails(shift.closedBy);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Shift retrieved successfully',
            data: serializeShift(shift, createdByDetails, closedByDetails)
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch shift'
        });
    }
});
exports.getShiftById = getShiftById;
