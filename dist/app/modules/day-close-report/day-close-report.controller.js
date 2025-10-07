"use strict";
/**
 * Day Close Report Controller
 *
 * Handles day close report operations including viewing, downloading, and deleting reports.
 * Provides comprehensive reporting functionality with multiple export formats.
 *
 * @author API Team
 * @version 1.0.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.generateThermalReceipt = exports.deleteDayCloseReportsByDate = exports.getSingleDayCloseReport = exports.downloadDayCloseReports = exports.getDayCloseReportsByDate = exports.getDayCloseReports = void 0;
const shift_model_1 = require("../shift/shift.model");
const order_model_1 = require("../order/order.model");
const day_close_report_validation_1 = require("./day-close-report.validation");
const sales_service_1 = require("../shift/sales.service");
const day_sales_model_1 = require("./day-sales.model");
const day_close_model_1 = require("./day-close.model");
const auth_model_1 = require("../auth/auth.model");
const ExcelJS = __importStar(require("exceljs"));
const path = __importStar(require("path"));
const ejs = __importStar(require("ejs"));
const puppeteer = require('puppeteer');
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
 * Formats a date to YYYY-MM-DD format in the specified timezone
 * @param date - Date object to format
 * @param timezone - Timezone string (defaults to Asia/Dubai)
 * @returns Formatted date string in YYYY-MM-DD format
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
 * @param value - Date value to validate and convert
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
 * Serializes a day close document for API response
 * Converts Date objects to ISO strings for consistent JSON output
 * @param doc - Document to serialize
 * @param createdByDetails - User details for createdBy
 * @param closedByDetails - User details for closedBy
 * @returns Serialized object with ISO date strings and user details
 */
const serializeDayClose = (doc, createdByDetails, closedByDetails) => {
    if (!doc)
        return doc;
    const obj = typeof doc.toObject === 'function'
        ? doc.toObject({ versionKey: false })
        : Object.assign({}, doc);
    // Convert Date objects to ISO strings
    if (obj.startTime instanceof Date)
        obj.startTime = obj.startTime.toISOString();
    if (obj.endTime instanceof Date)
        obj.endTime = obj.endTime.toISOString();
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
 * Retrieves all shifts grouped by day with comprehensive statistics
 * Supports filtering by date range, status, and sorting options
 * @param req - Express request object
 * @param res - Express response object
 */
const getDayCloseReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = day_close_report_validation_1.dayCloseReportQueryValidation.parse(req.query || {});
        const reqUser = req;
        const branchId = reqUser.branchId;
        const timezone = reqUser.timezone || DEFAULT_TIMEZONE;
        const page = Math.max(1, query.page || 1);
        const limit = Math.max(1, Math.min(100, query.limit || 20));
        const skip = (page - 1) * limit;
        // Build filter object - Get shifts with "day-close" status (with shifts)
        const filter = { status: 'day-close' };
        if (query.status) {
            filter.status = query.status;
        }
        if (branchId)
            filter.branchId = branchId;
        // Handle date filtering logic
        if (query.date) {
            // Single date filter (legacy support)
            filter.startDate = query.date;
        }
        else if (query.startDate || query.endDate) {
            // Date range filtering
            if (query.startDate && query.endDate) {
                // Both start and end date provided - filter between dates
                filter.startDate = { $gte: query.startDate, $lte: query.endDate };
            }
            else if (query.startDate && !query.endDate) {
                // Only start date provided - show all records from start date onwards
                filter.startDate = { $gte: query.startDate };
            }
            else if (!query.startDate && query.endDate) {
                // Only end date provided - show all records up to end date
                filter.startDate = { $lte: query.endDate };
            }
        }
        // Build sort object
        const sort = {};
        if (query.sortBy) {
            sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
        }
        else {
            sort.startDate = -1; // Default sort by start date descending
            sort.startTime = -1; // Then by start time descending
        }
        // Get all shifts for the specified criteria
        const allShifts = yield shift_model_1.Shift.find(filter)
            .sort(sort)
            .lean();
        // Get all DayClose records for the specified criteria (no-shift scenarios)
        const dayCloseFilter = { status: 'day-close' };
        if (query.status) {
            dayCloseFilter.status = query.status;
        }
        if (branchId)
            dayCloseFilter.branchId = branchId;
        // Apply same date filtering logic for DayClose records
        if (query.date) {
            // Single date filter (legacy support)
            dayCloseFilter.startDate = query.date;
        }
        else if (query.startDate || query.endDate) {
            // Date range filtering
            if (query.startDate && query.endDate) {
                // Both start and end date provided - filter between dates
                dayCloseFilter.startDate = { $gte: query.startDate, $lte: query.endDate };
            }
            else if (query.startDate && !query.endDate) {
                // Only start date provided - show all records from start date onwards
                dayCloseFilter.startDate = { $gte: query.startDate };
            }
            else if (!query.startDate && query.endDate) {
                // Only end date provided - show all records up to end date
                dayCloseFilter.startDate = { $lte: query.endDate };
            }
        }
        const allDayCloseRecords = yield day_close_model_1.DayClose.find(dayCloseFilter)
            .sort(sort)
            .lean();
        // Group shifts by date
        const groupedShifts = {};
        const dayStats = {};
        // Process shifts with user details
        for (const shift of allShifts) {
            const date = shift.startDate;
            if (!groupedShifts[date]) {
                groupedShifts[date] = [];
                dayStats[date] = {
                    totalShifts: 0,
                    openShifts: 0,
                    closedShifts: 0,
                    dayCloseShifts: 0,
                    totalCash: 0,
                    firstShiftTime: null,
                    lastShiftTime: null
                };
            }
            // Get user details for createdBy and closedBy
            const createdByDetails = yield populateUserDetails(shift.createdBy);
            const closedByDetails = yield populateUserDetails(shift.closedBy);
            groupedShifts[date].push(serializeDayClose(shift, createdByDetails, closedByDetails));
            // Update day statistics
            dayStats[date].totalShifts++;
            if (shift.status === 'open')
                dayStats[date].openShifts++;
            if (shift.status === 'closed')
                dayStats[date].closedShifts++;
            if (shift.status === 'day-close')
                dayStats[date].dayCloseShifts++;
            // Calculate total cash for the day
            if (shift.denominations && shift.denominations.totalCash) {
                dayStats[date].totalCash += shift.denominations.totalCash;
            }
            // Track first and last shift times
            if (!dayStats[date].firstShiftTime || shift.startTime < dayStats[date].firstShiftTime) {
                dayStats[date].firstShiftTime = shift.startTime;
            }
            if (!dayStats[date].lastShiftTime || shift.startTime > dayStats[date].lastShiftTime) {
                dayStats[date].lastShiftTime = shift.startTime;
            }
        }
        // Process DayClose records (no-shift scenarios) with user details
        for (const dayClose of allDayCloseRecords) {
            const date = dayClose.startDate;
            if (!groupedShifts[date]) {
                groupedShifts[date] = [];
                dayStats[date] = {
                    totalShifts: 0,
                    openShifts: 0,
                    closedShifts: 0,
                    dayCloseShifts: 0,
                    totalCash: 0,
                    firstShiftTime: null,
                    lastShiftTime: null
                };
            }
            // Get user details for createdBy and closedBy
            const createdByDetails = yield populateUserDetails(dayClose.createdBy);
            const closedByDetails = yield populateUserDetails(dayClose.closedBy);
            // Add DayClose record as a special "whole day" entry
            const dayCloseEntry = Object.assign(Object.assign({}, serializeDayClose(dayClose, createdByDetails, closedByDetails)), { isWholeDay: true, recordType: 'day-close' });
            groupedShifts[date].push(dayCloseEntry);
            // Update day statistics for DayClose records
            dayStats[date].totalShifts++;
            if (dayClose.status === 'closed')
                dayStats[date].closedShifts++;
            if (dayClose.status === 'day-close')
                dayStats[date].dayCloseShifts++;
            // Track first and last times
            if (!dayStats[date].firstShiftTime || dayClose.startTime < dayStats[date].firstShiftTime) {
                dayStats[date].firstShiftTime = dayClose.startTime;
            }
            if (!dayStats[date].lastShiftTime || dayClose.startTime > dayStats[date].lastShiftTime) {
                dayStats[date].lastShiftTime = dayClose.startTime;
            }
        }
        // Convert grouped data to array format for pagination
        const sortedDates = Object.keys(groupedShifts).sort((a, b) => b.localeCompare(a));
        const paginatedDates = sortedDates.slice(skip, skip + limit);
        // Get sales data for each date from DaySales schema
        const result = [];
        for (const date of paginatedDates) {
            const salesData = yield day_sales_model_1.DaySales.findOne(Object.assign({ date: date }, (branchId ? { branchId } : {}))).lean();
            // Calculate day-wise totals from all shifts for this date
            let dayWiseTotals = {
                totalOrders: 0,
                totalSales: 0,
                payments: {
                    cash: 0,
                    card: 0,
                    online: 0
                }
            };
            // If we have stored sales data, use it; otherwise calculate from shifts
            if (salesData) {
                dayWiseTotals = salesData.daySales;
            }
            else {
                // Calculate from individual shifts as fallback
                groupedShifts[date].forEach(shift => {
                    var _a, _b, _c;
                    if (shift.sales) {
                        dayWiseTotals.totalOrders += shift.sales.totalOrders || 0;
                        dayWiseTotals.totalSales += shift.sales.totalSales || 0;
                        dayWiseTotals.payments.cash += ((_a = shift.sales.payments) === null || _a === void 0 ? void 0 : _a.cash) || 0;
                        dayWiseTotals.payments.card += ((_b = shift.sales.payments) === null || _b === void 0 ? void 0 : _b.card) || 0;
                        dayWiseTotals.payments.online += ((_c = shift.sales.payments) === null || _c === void 0 ? void 0 : _c.online) || 0;
                    }
                });
            }
            // Update total cash from denomination data if available
            if (salesData && salesData.denomination && salesData.denomination.totalCash) {
                dayStats[date].totalCash = salesData.denomination.totalCash;
            }
            // Check if any shift has "day-close" status to determine if we should show shift-wise listings
            const hasDayCloseStatus = groupedShifts[date].some(shift => shift.status === 'day-close');
            const hasClosedStatus = groupedShifts[date].some(shift => shift.status === 'closed');
            // Filter shifts based on status logic:
            // - If any shift has "day-close" status, show all shifts
            // - If only "closed" status exists, don't show shift-wise listings
            let filteredShifts = groupedShifts[date];
            if (hasDayCloseStatus) {
                // Show all shifts when day-close status exists
                filteredShifts = groupedShifts[date];
            }
            else if (hasClosedStatus && !hasDayCloseStatus) {
                // Don't show shift-wise listings when only closed status exists
                filteredShifts = [];
            }
            result.push({
                date,
                shifts: filteredShifts,
                statistics: dayStats[date],
                shiftCount: filteredShifts.length,
                sales: {
                    dayWise: dayWiseTotals, // All orders for the entire day
                    shiftWise: salesData ? salesData.shiftWiseSales : (() => {
                        // Calculate shift-wise totals from individual shifts
                        let shiftWiseTotals = {
                            totalOrders: 0,
                            totalSales: 0,
                            payments: { cash: 0, card: 0, online: 0 }
                        };
                        filteredShifts.forEach(shift => {
                            var _a, _b, _c;
                            if (shift.sales) {
                                shiftWiseTotals.totalOrders += shift.sales.totalOrders || 0;
                                shiftWiseTotals.totalSales += shift.sales.totalSales || 0;
                                shiftWiseTotals.payments.cash += ((_a = shift.sales.payments) === null || _a === void 0 ? void 0 : _a.cash) || 0;
                                shiftWiseTotals.payments.card += ((_b = shift.sales.payments) === null || _b === void 0 ? void 0 : _b.card) || 0;
                                shiftWiseTotals.payments.online += ((_c = shift.sales.payments) === null || _c === void 0 ? void 0 : _c.online) || 0;
                            }
                        });
                        return shiftWiseTotals;
                    })(),
                    summary: {
                        totalShifts: (salesData === null || salesData === void 0 ? void 0 : salesData.totalShifts) || filteredShifts.length,
                        dayCloseTime: salesData === null || salesData === void 0 ? void 0 : salesData.dayCloseTime,
                        closedBy: salesData === null || salesData === void 0 ? void 0 : salesData.closedBy
                    }
                }
            });
        }
        const totalDays = Object.keys(groupedShifts).length;
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'All day close reports retrieved successfully',
            data: result,
            meta: {
                page,
                limit,
                total: totalDays,
                pages: Math.ceil(totalDays / limit),
                totalShifts: allShifts.length,
                totalDayCloseRecords: allDayCloseRecords.length,
                recordTypes: {
                    hasShiftBasedRecords: allShifts.length > 0,
                    hasWholeDayRecords: allDayCloseRecords.length > 0,
                    mixedMode: allShifts.length > 0 && allDayCloseRecords.length > 0
                },
                uiSuggestions: {
                    showShiftWiseOption: allShifts.length > 0,
                    showWholeDayWiseOption: allDayCloseRecords.length > 0,
                    defaultView: allShifts.length > 0 ? 'shift-wise' : 'whole-day-wise'
                },
                dateRange: {
                    from: sortedDates[sortedDates.length - 1] || null,
                    to: sortedDates[0] || null
                }
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch shifts grouped by day'
        });
    }
});
exports.getDayCloseReports = getDayCloseReports;
/**
 * Retrieves all day close reports for a specific date
 * @param req - Express request object
 * @param res - Express response object
 */
const getDayCloseReportsByDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.params;
        const reqUser = req;
        const branchId = reqUser.branchId;
        // Build filter for day-close reports for specific date (with shifts)
        const filter = { status: 'day-close' };
        if (branchId)
            filter.branchId = branchId;
        if (date)
            filter.startDate = date;
        // Get shift-based reports
        const shiftReports = yield shift_model_1.Shift.find(filter).sort({ startTime: -1 }).lean();
        // Get DayClose records for the same date (no-shift scenarios)
        const dayCloseFilter = { status: 'day-close' };
        if (branchId)
            dayCloseFilter.branchId = branchId;
        if (date)
            dayCloseFilter.startDate = date;
        const dayCloseReports = yield day_close_model_1.DayClose.find(dayCloseFilter).sort({ startTime: -1 }).lean();
        // Combine both types of reports with user details
        const allReports = [];
        // Process shift reports with user details
        for (const report of shiftReports) {
            const createdByDetails = yield populateUserDetails(report.createdBy);
            const closedByDetails = yield populateUserDetails(report.closedBy);
            allReports.push(Object.assign(Object.assign({}, serializeDayClose(report, createdByDetails, closedByDetails)), { recordType: 'shift' }));
        }
        // Process day close reports with user details
        for (const report of dayCloseReports) {
            const createdByDetails = yield populateUserDetails(report.createdBy);
            const closedByDetails = yield populateUserDetails(report.closedBy);
            allReports.push(Object.assign(Object.assign({}, serializeDayClose(report, createdByDetails, closedByDetails)), { recordType: 'day-close', isWholeDay: true }));
        }
        // Sort by start time
        allReports.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        if (allReports.length === 0) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'No day close reports found for the specified date'
            });
            return;
        }
        // Check if we have shift records or just DayClose records
        const hasShiftRecords = allReports.some(report => report.recordType === 'shift');
        const hasDayCloseRecords = allReports.some(report => report.recordType === 'day-close');
        // Filter reports based on record type logic:
        // - If we have shift records, show all reports (with shifts)
        // - If we only have DayClose records, show DayClose records (no shifts)
        let filteredReports = allReports;
        if (hasShiftRecords) {
            // Show all reports when shift records exist (with shifts)
            filteredReports = allReports;
        }
        else if (hasDayCloseRecords && !hasShiftRecords) {
            // Show DayClose records when only DayClose records exist (no shifts)
            filteredReports = allReports;
        }
        // Get day-wise sales data from DaySales schema
        const salesData = yield day_sales_model_1.DaySales.findOne(Object.assign({ date: date }, (branchId ? { branchId } : {}))).lean();
        // Calculate day-wise totals
        let dayWiseTotals = {
            totalOrders: 0,
            totalSales: 0,
            payments: {
                cash: 0,
                card: 0,
                online: 0
            }
        };
        // If we have stored sales data, use it; otherwise calculate from shifts
        if (salesData) {
            dayWiseTotals = salesData.daySales;
        }
        else {
            // Calculate from individual shifts as fallback
            allReports.forEach(report => {
                var _a, _b, _c;
                // Only process sales data from shift records (not DayClose records)
                if (report.recordType === 'shift' && report.sales) {
                    const sales = report.sales;
                    dayWiseTotals.totalOrders += sales.totalOrders || 0;
                    dayWiseTotals.totalSales += sales.totalSales || 0;
                    dayWiseTotals.payments.cash += ((_a = sales.payments) === null || _a === void 0 ? void 0 : _a.cash) || 0;
                    dayWiseTotals.payments.card += ((_b = sales.payments) === null || _b === void 0 ? void 0 : _b.card) || 0;
                    dayWiseTotals.payments.online += ((_c = sales.payments) === null || _c === void 0 ? void 0 : _c.online) || 0;
                }
            });
        }
        // Calculate record type statistics
        const shiftReportsForDate = filteredReports.filter(r => r.recordType === 'shift');
        const dayCloseReportsForDate = filteredReports.filter(r => r.recordType === 'day-close');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Day close reports retrieved successfully for date',
            data: filteredReports,
            total: filteredReports.length,
            date: date,
            recordTypes: {
                shiftBased: shiftReportsForDate.length,
                wholeDayBased: dayCloseReportsForDate.length,
                hasShifts: shiftReportsForDate.length > 0,
                hasWholeDay: dayCloseReportsForDate.length > 0
            },
            uiSuggestions: {
                showShiftWiseOption: shiftReportsForDate.length > 0,
                showWholeDayWiseOption: dayCloseReportsForDate.length > 0,
                defaultView: shiftReportsForDate.length > 0 ? 'shift-wise' : 'whole-day-wise',
                recommendedView: shiftReportsForDate.length > 0 ? 'shift-wise' : 'whole-day-wise'
            },
            sales: {
                dayWise: dayWiseTotals, // All orders for the entire day
                shiftWise: salesData ? salesData.shiftWiseSales : (() => {
                    // Calculate shift-wise totals from individual shifts
                    let shiftWiseTotals = {
                        totalOrders: 0,
                        totalSales: 0,
                        payments: { cash: 0, card: 0, online: 0 }
                    };
                    filteredReports.forEach(report => {
                        var _a, _b, _c;
                        // Only process sales data from shift records (not DayClose records)
                        if (report.recordType === 'shift' && report.sales) {
                            const sales = report.sales;
                            shiftWiseTotals.totalOrders += sales.totalOrders || 0;
                            shiftWiseTotals.totalSales += sales.totalSales || 0;
                            shiftWiseTotals.payments.cash += ((_a = sales.payments) === null || _a === void 0 ? void 0 : _a.cash) || 0;
                            shiftWiseTotals.payments.card += ((_b = sales.payments) === null || _b === void 0 ? void 0 : _b.card) || 0;
                            shiftWiseTotals.payments.online += ((_c = sales.payments) === null || _c === void 0 ? void 0 : _c.online) || 0;
                        }
                    });
                    return shiftWiseTotals;
                })(),
                summary: {
                    totalShifts: (salesData === null || salesData === void 0 ? void 0 : salesData.totalShifts) || filteredReports.length,
                    dayCloseTime: salesData === null || salesData === void 0 ? void 0 : salesData.dayCloseTime,
                    closedBy: salesData === null || salesData === void 0 ? void 0 : salesData.closedBy
                }
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch day close reports for date'
        });
    }
});
exports.getDayCloseReportsByDate = getDayCloseReportsByDate;
/**
 * Downloads day close reports in various formats (CSV, Excel, PDF)
 * Supports filtering by date range, selected days, and specific report IDs
 * Includes day-wise, shift-wise, and thermal receipt data
 * @param req - Express request object
 * @param res - Express response object
 */
const downloadDayCloseReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parse parameters from query string only
        const payload = day_close_report_validation_1.downloadReportValidation.parse(req.query);
        const reqUser = req;
        const branchId = reqUser.branchId;
        const timezone = reqUser.timezone || DEFAULT_TIMEZONE;
        // Determine which dates to process
        let targetDates = [];
        if (payload.selectedDays && payload.selectedDays.length > 0) {
            // Check if selectedDays contains a date range (start and end dates)
            if (payload.selectedDays.length === 2) {
                const [startDate, endDate] = payload.selectedDays;
                // If we have exactly 2 dates, treat as date range
                const start = new Date(startDate);
                const end = new Date(endDate);
                console.log(`Treating as date range: ${startDate} to ${endDate}`);
                // Generate all dates in range
                const currentDate = new Date(start);
                while (currentDate <= end) {
                    targetDates.push(formatYMD(currentDate, timezone));
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            else {
                // Use selected days from frontend checkboxes (individual dates)
                console.log(`Using individual selected days:`, payload.selectedDays);
                targetDates = payload.selectedDays;
            }
        }
        else if (payload.date) {
            // Single date filter (legacy support)
            targetDates = [payload.date];
        }
        else if (payload.startDate || payload.endDate) {
            // Date range filtering - get all dates in range
            const startDate = payload.startDate ? new Date(payload.startDate) : new Date('1900-01-01');
            const endDate = payload.endDate ? new Date(payload.endDate) : new Date();
            // Generate all dates in range
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                targetDates.push(formatYMD(currentDate, timezone));
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        else {
            // No specific dates - get all available dates from multiple sources
            const allDaySales = yield day_sales_model_1.DaySales.find(Object.assign({}, (branchId ? { branchId } : {})), { date: 1 }).sort({ date: -1 }).lean();
            // Also get dates from shifts and daycloses to include all activity
            const allShifts = yield shift_model_1.Shift.find(Object.assign({}, (branchId ? { branchId } : {})), { startDate: 1 }).sort({ startDate: -1 }).lean();
            const allDayCloses = yield day_close_model_1.DayClose.find(Object.assign({}, (branchId ? { branchId } : {})), { startDate: 1 }).sort({ startDate: -1 }).lean();
            // Combine all dates from different sources
            const allDates = [
                ...allDaySales.map(ds => ds.date),
                ...allShifts.map(shift => shift.startDate),
                ...allDayCloses.map(dc => dc.startDate)
            ];
            targetDates = allDates;
        }
        // Remove duplicates to prevent same data appearing twice
        const originalLength = targetDates.length;
        targetDates = [...new Set(targetDates)];
        console.log(`Processing ${targetDates.length} dates:`, targetDates);
        if (originalLength !== targetDates.length) {
            console.log(`Removed ${originalLength - targetDates.length} duplicate dates from target dates`);
        }
        if (targetDates.length === 0) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'No dates found for the specified criteria'
            });
            return;
        }
        // Collect comprehensive data for all target dates
        const reportData = yield collectComprehensiveReportData(targetDates, branchId, payload);
        if (reportData.length === 0) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'No day close reports found for the specified criteria'
            });
            return;
        }
        // Generate simple filename based on filters
        let fileName = 'day-close-report';
        if (payload.selectedDays && payload.selectedDays.length > 0) {
            if (payload.selectedDays.length === 2) {
                const [startDate, endDate] = payload.selectedDays;
                fileName = `day-close-report-${startDate}-to-${endDate}`;
            }
            else {
                fileName = `day-close-report-${payload.selectedDays.length}-days`;
            }
        }
        else if (payload.date) {
            fileName = `day-close-report-${payload.date}`;
        }
        else if (payload.startDate && payload.endDate) {
            fileName = `day-close-report-${payload.startDate}-to-${payload.endDate}`;
        }
        else {
            fileName = `day-close-report-${new Date().toISOString().split('T')[0]}`;
        }
        switch (payload.format) {
            case 'csv':
                yield downloadEnhancedCSV(reportData, res, fileName, payload);
                break;
            case 'excel':
                yield downloadEnhancedExcel(reportData, res, fileName, payload);
                break;
            case 'pdf':
                yield downloadEnhancedPDF(reportData, res, fileName, payload);
                break;
            default:
                res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: 'Unsupported format. Use: csv, excel, or pdf'
                });
        }
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to download reports'
        });
    }
});
exports.downloadDayCloseReports = downloadDayCloseReports;
/**
 * Retrieves a single day close report by ID
 * @param req - Express request object
 * @param res - Express response object
 */
const getSingleDayCloseReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = day_close_report_validation_1.idValidation.parse(req.params);
        const reqUser = req;
        const branchId = reqUser.branchId;
        // Build filter for specific day-close report (supports both statuses)
        const filter = {
            _id: id,
            status: 'day-close'
        };
        if (branchId)
            filter.branchId = branchId;
        // Try to find in Shift records first
        let report = yield shift_model_1.Shift.findOne(filter).lean();
        let recordType = 'shift';
        // If not found in Shift, try DayClose records
        if (!report) {
            report = yield day_close_model_1.DayClose.findOne(filter).lean();
            recordType = 'day-close';
        }
        if (!report) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'Day close report not found'
            });
            return;
        }
        // Get all shifts for the same date to show shift-wise breakdown
        const allShiftsForDate = yield shift_model_1.Shift.find(Object.assign({ startDate: report.startDate }, (branchId ? { branchId } : {}))).sort({ startTime: 1 }).lean();
        // Check if any shift has "day-close" status to determine if we should show shift-wise listings
        const hasDayCloseStatus = allShiftsForDate.some(shift => shift.status === 'day-close');
        const hasClosedStatus = allShiftsForDate.some(shift => shift.status === 'closed');
        // Filter shifts based on status logic:
        // - If any shift has "day-close" status, show all shifts
        // - If only "closed" status exists, don't show shift-wise listings
        let filteredShiftsForDate = allShiftsForDate;
        if (hasDayCloseStatus) {
            // Show all shifts when day-close status exists
            filteredShiftsForDate = allShiftsForDate;
        }
        else if (hasClosedStatus && !hasDayCloseStatus) {
            // Don't show shift-wise listings when only closed status exists
            filteredShiftsForDate = [];
        }
        // Try to get stored sales data from DaySales schema
        let daySalesData;
        let shiftWiseTotals;
        const storedSalesData = yield day_sales_model_1.DaySales.findOne(Object.assign({ date: report.startDate }, (branchId ? { branchId } : {}))).lean();
        if (storedSalesData) {
            // Use stored data
            daySalesData = storedSalesData.daySales;
            shiftWiseTotals = {
                totalShifts: storedSalesData.totalShifts,
                totalOrders: storedSalesData.shiftWiseSales.totalOrders,
                totalSales: storedSalesData.shiftWiseSales.totalSales,
                totalPayments: storedSalesData.shiftWiseSales.payments,
                shifts: storedSalesData.shifts
            };
        }
        else {
            // Fallback to recalculation if no stored data
            const startOfDay = new Date(report.startDate + 'T00:00:00.000Z');
            const endOfDay = new Date(report.startDate + 'T23:59:59.999Z');
            daySalesData = yield (0, sales_service_1.calculateSales)(startOfDay, endOfDay, branchId);
            // Calculate shift-wise totals from individual shifts
            shiftWiseTotals = {
                totalShifts: filteredShiftsForDate.length,
                totalOrders: 0,
                totalSales: 0,
                totalPayments: { cash: 0, card: 0, online: 0 },
                shifts: []
            };
            filteredShiftsForDate.forEach(shift => {
                var _a, _b, _c;
                if (shift.sales) {
                    shiftWiseTotals.totalOrders += shift.sales.totalOrders || 0;
                    shiftWiseTotals.totalSales += shift.sales.totalSales || 0;
                    shiftWiseTotals.totalPayments.cash += ((_a = shift.sales.payments) === null || _a === void 0 ? void 0 : _a.cash) || 0;
                    shiftWiseTotals.totalPayments.card += ((_b = shift.sales.payments) === null || _b === void 0 ? void 0 : _b.card) || 0;
                    shiftWiseTotals.totalPayments.online += ((_c = shift.sales.payments) === null || _c === void 0 ? void 0 : _c.online) || 0;
                    shiftWiseTotals.shifts.push({
                        shiftId: shift._id.toString(),
                        shiftNumber: shift.shiftNumber,
                        startTime: shift.startTime,
                        endTime: shift.endTime || new Date(),
                        sales: shift.sales
                    });
                }
            });
        }
        // Get user details for the main report
        const createdByDetails = yield populateUserDetails(report.createdBy);
        const closedByDetails = yield populateUserDetails(report.closedBy);
        // Get user details for shift breakdown
        const shiftBreakdownWithDetails = yield Promise.all(filteredShiftsForDate.map((shift) => __awaiter(void 0, void 0, void 0, function* () {
            const shiftCreatedByDetails = yield populateUserDetails(shift.createdBy);
            const shiftClosedByDetails = yield populateUserDetails(shift.closedBy);
            return {
                shiftId: shift._id,
                shiftNumber: shift.shiftNumber,
                startTime: shift.startTime,
                endTime: shift.endTime,
                status: shift.status,
                sales: shift.sales || null,
                createdByDetails: shiftCreatedByDetails,
                closedByDetails: shiftClosedByDetails
            };
        })));
        const responseData = Object.assign(Object.assign({}, serializeDayClose(report, createdByDetails, closedByDetails)), { recordType: recordType, isWholeDay: recordType === 'day-close', shiftBreakdown: shiftBreakdownWithDetails, 
            // Day-wise totals (all orders for the entire day)
            daySalesSummary: daySalesData, 
            // Shift-wise totals (only orders from shifts)
            shiftWiseTotals: shiftWiseTotals, 
            // Summary comparison
            summary: {
                dayWise: {
                    totalOrders: (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.totalOrders) || 0,
                    totalSales: (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.totalSales) || 0,
                    description: "All orders for the entire day"
                },
                shiftWise: {
                    totalOrders: shiftWiseTotals.totalOrders,
                    totalSales: shiftWiseTotals.totalSales,
                    description: "Orders from shifts only"
                }
            } });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Day close report retrieved successfully',
            data: responseData
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to fetch day close report'
        });
    }
});
exports.getSingleDayCloseReport = getSingleDayCloseReport;
/**
 * Deletes all day close reports for a specific date
 * Simple API that handles everything for one day
 * @param req - Express request object
 * @param res - Express response object
 */
const deleteDayCloseReportsByDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = day_close_report_validation_1.dateValidation.parse(req.params);
        const reqUser = req;
        const branchId = reqUser.branchId;
        // Build filters for all related records - MUST include branchId for security
        if (!branchId) {
            res.status(403).json({
                success: false,
                statusCode: 403,
                message: 'Branch ID is required for delete operation'
            });
            return;
        }
        const shiftFilter = {
            startDate: date,
            status: 'day-close',
            branchId: branchId // Always include branchId for security
        };
        const dayCloseFilter = {
            startDate: date,
            status: 'day-close',
            branchId: branchId // Always include branchId for security
        };
        const daySalesFilter = {
            date: date,
            branchId: branchId // Always include branchId for security
        };
        // Check if any records exist before deletion
        const [existingShifts, existingDayClose, existingDaySales] = yield Promise.all([
            shift_model_1.Shift.find(shiftFilter).lean(),
            day_close_model_1.DayClose.find(dayCloseFilter).lean(),
            day_sales_model_1.DaySales.find(daySalesFilter).lean()
        ]);
        if (existingShifts.length === 0 && existingDayClose.length === 0 && existingDaySales.length === 0) {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'No day close reports found for the specified date'
            });
            return;
        }
        // Delete all related records for this date and branch
        const [shiftResult, dayCloseResult, daySalesResult] = yield Promise.all([
            shift_model_1.Shift.deleteMany(shiftFilter),
            day_close_model_1.DayClose.deleteMany(dayCloseFilter),
            day_sales_model_1.DaySales.deleteMany(daySalesFilter)
        ]);
        const totalDeleted = shiftResult.deletedCount + dayCloseResult.deletedCount + daySalesResult.deletedCount;
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: `Day close reports deleted successfully for ${date}`,
            data: {
                date: date,
                branchId: branchId,
                totalDeleted: totalDeleted
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to delete day close reports for the specified date'
        });
    }
});
exports.deleteDayCloseReportsByDate = deleteDayCloseReportsByDate;
/**
 * Generates thermal receipt HTML for day-close reports (Optimized)
 * Uses DaySales table for better performance
 * @param req - Express request object
 * @param res - Express response object
 */
const generateThermalReceipt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.params;
        const reqUser = req;
        const branchId = reqUser.branchId;
        const timezone = reqUser.timezone || DEFAULT_TIMEZONE;
        if (!date) {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Date parameter is required'
            });
            return;
        }
        // Use DaySales data for thermal receipt generation (optimized)
        let thermalData;
        try {
            // Try to get data from DaySales table first (optimized)
            const daySalesData = yield day_sales_model_1.DaySales.findOne(Object.assign({ date: date }, (branchId ? { branchId } : {}))).lean();
            if (daySalesData) {
                // Use stored DaySales data with denomination
                thermalData = formatThermalReceiptFromDaySales(daySalesData, date, timezone);
            }
            else {
                // Fallback: Get orders and calculate (for days without DaySales record)
                const startOfDay = new Date(date + 'T00:00:00.000Z');
                const endOfDay = new Date(date + 'T23:59:59.999Z');
                const orderQuery = {
                    $or: [
                        {
                            createdAt: {
                                $gte: startOfDay,
                                $lte: endOfDay
                            }
                        },
                        {
                            updatedAt: {
                                $gte: startOfDay,
                                $lte: endOfDay
                            }
                        }
                    ],
                    status: 'paid',
                    canceled: { $ne: true },
                    isDeleted: { $ne: true }
                };
                if (branchId) {
                    orderQuery.branchId = branchId;
                }
                const orders = yield order_model_1.Order.find(orderQuery).lean();
                if (orders.length === 0) {
                    res.status(404).json({
                        success: false,
                        statusCode: 404,
                        message: 'No orders found for the specified date'
                    });
                    return;
                }
                thermalData = formatThermalReceiptData(orders, date, timezone);
            }
        }
        catch (error) {
            console.error('Error getting thermal data:', error);
            res.status(500).json({
                success: false,
                statusCode: 500,
                message: 'Failed to retrieve thermal receipt data'
            });
            return;
        }
        // Render EJS template
        const templatePath = path.join(__dirname, 'templates', 'thermal-receipt.ejs');
        try {
            const html = ejs.renderFile(templatePath, thermalData, (err, html) => {
                if (err) {
                    console.error('EJS rendering error:', err);
                    res.status(500).json({
                        success: false,
                        statusCode: 500,
                        message: 'Failed to render thermal receipt template'
                    });
                    return;
                }
                // Set headers for HTML response
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Cache-Control', 'no-cache');
                // Send the rendered HTML
                res.status(200).send(html);
            });
        }
        catch (error) {
            console.error('Template rendering error:', error);
            res.status(500).json({
                success: false,
                statusCode: 500,
                message: 'Failed to render thermal receipt template'
            });
        }
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: (error === null || error === void 0 ? void 0 : error.message) || 'Failed to generate thermal receipt data'
        });
    }
});
exports.generateThermalReceipt = generateThermalReceipt;
/**
 * Formats DaySales data into thermal receipt format (Optimized)
 * Uses pre-calculated data from DaySales table
 * @param daySalesData - DaySales document
 * @param date - Date string in YYYY-MM-DD format
 * @param timezone - Timezone for date formatting
 * @returns Formatted thermal receipt data
 */
const formatThermalReceiptFromDaySales = (daySalesData, date, timezone) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
    const daySales = daySalesData.daySales;
    const shiftWiseSales = daySalesData.shiftWiseSales;
    // Format date for display
    const displayDate = new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    // Get current time
    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    return {
        header: {
            businessName: "TOTALLY HEALTHY",
            location: "Sharjah",
            date: displayDate,
            time: currentTime,
            reportType: "Shift Report"
        },
        shiftDetails: {
            cashier: "CASH",
            logInDate: displayDate,
            logInTime: "12:06 AM",
            logOutDate: displayDate,
            logOutTime: currentTime,
            totalPax: daySales.totalOrders || 0
        },
        summary: {
            totalInvoiceAmount: (daySales.totalSales || 0).toFixed(2),
            totalDiscountAmount: (daySales.totalDiscount || 0).toFixed(2),
            totalEatSmartAmount: "0.00",
            netSalesAmount: ((daySales.totalSales || 0) - (daySales.totalDiscount || 0)).toFixed(2),
            vatAmount: (daySales.totalVat || 0).toFixed(2),
            grandTotal: (daySales.totalSales || 0).toFixed(2)
        },
        salesDetails: {
            restaurantSales: (((_a = daySales.salesByType) === null || _a === void 0 ? void 0 : _a.restaurant) || 0).toFixed(2),
            membershipMeal: (((_b = daySales.salesByType) === null || _b === void 0 ? void 0 : _b.membership) || 0).toFixed(2),
            membershipRegister: "0.00" // This would need separate tracking if needed
        },
        collectionDetails: {
            cashSalesAmount: (((_c = daySales.payments) === null || _c === void 0 ? void 0 : _c.cash) || 0).toFixed(2),
            creditCardAmount: (((_d = daySales.payments) === null || _d === void 0 ? void 0 : _d.card) || 0).toFixed(2),
            onlineSalesAmount: (((_e = daySales.salesByType) === null || _e === void 0 ? void 0 : _e.online) || 0).toFixed(2),
            tawseelAmount: "0.00",
            totalCollection: (daySales.totalSales || 0).toFixed(2)
        },
        cashDetails: {
            totalPayInAmount: "0.00",
            totalPayOutAmount: "0.00"
        },
        denomination: {
            denominations: [
                { value: "1000 DH", quantity: (((_f = daySalesData.denomination) === null || _f === void 0 ? void 0 : _f.denomination1000) || 0).toFixed(2), amount: ((((_g = daySalesData.denomination) === null || _g === void 0 ? void 0 : _g.denomination1000) || 0) * 1000).toFixed(2) },
                { value: "500 DHS", quantity: (((_h = daySalesData.denomination) === null || _h === void 0 ? void 0 : _h.denomination500) || 0).toFixed(2), amount: ((((_j = daySalesData.denomination) === null || _j === void 0 ? void 0 : _j.denomination500) || 0) * 500).toFixed(2) },
                { value: "200 DHS", quantity: (((_k = daySalesData.denomination) === null || _k === void 0 ? void 0 : _k.denomination200) || 0).toFixed(2), amount: ((((_l = daySalesData.denomination) === null || _l === void 0 ? void 0 : _l.denomination200) || 0) * 200).toFixed(2) },
                { value: "100 DHS", quantity: (((_m = daySalesData.denomination) === null || _m === void 0 ? void 0 : _m.denomination100) || 0).toFixed(2), amount: ((((_o = daySalesData.denomination) === null || _o === void 0 ? void 0 : _o.denomination100) || 0) * 100).toFixed(2) },
                { value: "50 DHS", quantity: (((_p = daySalesData.denomination) === null || _p === void 0 ? void 0 : _p.denomination50) || 0).toFixed(2), amount: ((((_q = daySalesData.denomination) === null || _q === void 0 ? void 0 : _q.denomination50) || 0) * 50).toFixed(2) },
                { value: "20 DHS", quantity: (((_r = daySalesData.denomination) === null || _r === void 0 ? void 0 : _r.denomination20) || 0).toFixed(2), amount: ((((_s = daySalesData.denomination) === null || _s === void 0 ? void 0 : _s.denomination20) || 0) * 20).toFixed(2) },
                { value: "10 DHS", quantity: (((_t = daySalesData.denomination) === null || _t === void 0 ? void 0 : _t.denomination10) || 0).toFixed(2), amount: ((((_u = daySalesData.denomination) === null || _u === void 0 ? void 0 : _u.denomination10) || 0) * 10).toFixed(2) },
                { value: "5 DHS", quantity: (((_v = daySalesData.denomination) === null || _v === void 0 ? void 0 : _v.denomination5) || 0).toFixed(2), amount: ((((_w = daySalesData.denomination) === null || _w === void 0 ? void 0 : _w.denomination5) || 0) * 5).toFixed(2) },
                { value: "2 DHS", quantity: (((_x = daySalesData.denomination) === null || _x === void 0 ? void 0 : _x.denomination2) || 0).toFixed(2), amount: ((((_y = daySalesData.denomination) === null || _y === void 0 ? void 0 : _y.denomination2) || 0) * 2).toFixed(2) },
                { value: "1 DHS", quantity: (((_z = daySalesData.denomination) === null || _z === void 0 ? void 0 : _z.denomination1) || 0).toFixed(2), amount: ((((_0 = daySalesData.denomination) === null || _0 === void 0 ? void 0 : _0.denomination1) || 0) * 1).toFixed(2) }
            ],
            totalAmount: (((_1 = daySalesData.denomination) === null || _1 === void 0 ? void 0 : _1.totalCash) || 0).toFixed(2), // Use stored denomination total
            expectedCashSales: (((_2 = daySales.payments) === null || _2 === void 0 ? void 0 : _2.cash) || 0).toFixed(2),
            actualCashCount: (((_3 = daySalesData.denomination) === null || _3 === void 0 ? void 0 : _3.totalCash) || 0).toFixed(2), // Use stored denomination total
            difference: ((((_4 = daySalesData.denomination) === null || _4 === void 0 ? void 0 : _4.totalCash) || 0) - (((_5 = daySales.payments) === null || _5 === void 0 ? void 0 : _5.cash) || 0)).toFixed(2) // Calculate difference
        },
        difference: {
            totalDifferenceInCash: ((((_6 = daySalesData.denomination) === null || _6 === void 0 ? void 0 : _6.totalCash) || 0) - (((_7 = daySales.payments) === null || _7 === void 0 ? void 0 : _7.cash) || 0)).toFixed(2)
        },
        rawData: {
            totalOrders: daySales.totalOrders || 0,
            daySalesData: daySales,
            shiftWiseData: shiftWiseSales,
            source: 'DaySales'
        }
    };
};
/**
 * Formats order data into thermal receipt format
 * Supports both membership and non-membership orders
 * @param orders - Array of order objects
 * @param date - Date string in YYYY-MM-DD format
 * @param timezone - Timezone for date formatting
 * @returns Formatted thermal receipt data
 */
const formatThermalReceiptData = (orders, date, timezone) => {
    // Calculate totals
    let totalInvoiceAmount = 0;
    let totalDiscountAmount = 0;
    let totalVatAmount = 0;
    let netSalesAmount = 0;
    let grandTotal = 0;
    // Sales breakdown by type
    let restaurantSales = 0;
    let membershipMeal = 0;
    let membershipRegister = 0;
    // Collection breakdown
    let cashSales = 0;
    let creditCardSales = 0;
    let onlineSales = 0;
    let tawseelSales = 0;
    // Process each order (using same logic as calculateSales function)
    orders.forEach(order => {
        const orderTotal = order.total || 0;
        const discountAmount = order.discountAmount || 0;
        const vatAmount = order.vatAmount || 0;
        // Calculate actual order amount from payments (same as calculateSales)
        let actualOrderAmount = 0;
        if (order.payments && order.payments.length > 0) {
            actualOrderAmount = order.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        }
        else {
            actualOrderAmount = order.payableAmount || orderTotal;
        }
        totalInvoiceAmount += orderTotal;
        totalDiscountAmount += discountAmount;
        totalVatAmount += vatAmount;
        netSalesAmount += (orderTotal - discountAmount);
        grandTotal += actualOrderAmount; // Use actual payment amount
        // Categorize by sales type - use actual payment amount
        if (order.salesType === 'restaurant') {
            restaurantSales += actualOrderAmount;
        }
        else if (order.salesType === 'online') {
            // Online sales should be categorized as online
            onlineSales += actualOrderAmount;
        }
        else if (order.salesType === 'membership') {
            // For membership sales type, check if it's a meal or registration
            if (order.orderType === 'membership') {
                membershipMeal += actualOrderAmount;
            }
            else {
                // If it's membership sales type but not membership order type, it's registration
                membershipRegister += actualOrderAmount;
            }
        }
        else {
            // For any other sales type, add to restaurant sales as fallback
            restaurantSales += actualOrderAmount;
        }
        // Process payments (same logic as calculateSales function)
        if (order.payments && order.payments.length > 0) {
            order.payments.forEach((payment) => {
                var _a;
                const amount = payment.amount || 0;
                switch ((_a = payment.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) {
                    case 'cash':
                        cashSales += amount;
                        break;
                    case 'card':
                        creditCardSales += amount;
                        break;
                    case 'gateway':
                        onlineSales += amount;
                        break;
                    case 'tawseel':
                        tawseelSales += amount;
                        break;
                    default:
                        onlineSales += amount; // UPI, Gateway, etc. (same as calculateSales)
                        break;
                }
            });
        }
        else {
            // No payment breakdown = use payableAmount or total (same as calculateSales)
            cashSales += actualOrderAmount;
        }
    });
    // Format date for display
    const displayDate = new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    // Get current time
    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    return {
        header: {
            businessName: "TOTALLY HEALTHY",
            location: "Sharjah",
            date: displayDate,
            time: currentTime,
            reportType: "Shift Report"
        },
        shiftDetails: {
            cashier: "CASH",
            logInDate: displayDate,
            logInTime: "12:06 AM",
            logOutDate: displayDate,
            logOutTime: currentTime,
            totalPax: orders.length
        },
        summary: {
            totalInvoiceAmount: totalInvoiceAmount.toFixed(2),
            totalDiscountAmount: totalDiscountAmount.toFixed(2),
            totalEatSmartAmount: "0.00",
            netSalesAmount: netSalesAmount.toFixed(2),
            vatAmount: totalVatAmount.toFixed(2),
            grandTotal: grandTotal.toFixed(2)
        },
        salesDetails: {
            restaurantSales: restaurantSales.toFixed(2),
            membershipMeal: membershipMeal.toFixed(2),
            membershipRegister: membershipRegister.toFixed(2)
        },
        collectionDetails: {
            cashSalesAmount: cashSales.toFixed(2),
            creditCardAmount: creditCardSales.toFixed(2),
            onlineSalesAmount: onlineSales.toFixed(2),
            tawseelAmount: tawseelSales.toFixed(2),
            totalCollection: (cashSales + creditCardSales + onlineSales + tawseelSales).toFixed(2)
        },
        cashDetails: {
            totalPayInAmount: "0.00",
            totalPayOutAmount: "0.00"
        },
        denomination: {
            denominations: [
                { value: "1000 DH", quantity: "0.00", amount: "0.00" },
                { value: "500 DHS", quantity: "0.00", amount: "0.00" },
                { value: "50 DHS", quantity: "0.00", amount: "0.00" },
                { value: "10 DHS", quantity: "0.00", amount: "0.00" },
                { value: "5 DHS", quantity: "0.00", amount: "0.00" },
                { value: "1 DHS", quantity: "0.00", amount: "0.00" },
                { value: "25 FILS", quantity: "0.00", amount: "0.00" }
            ],
            totalAmount: cashSales.toFixed(2), // Use actual cash sales amount
            expectedCashSales: cashSales.toFixed(2),
            actualCashCount: "0.00", // To be filled by staff during cash count
            difference: "0.00" // To be calculated: actualCount - expectedCashSales
        },
        difference: {
            totalDifferenceInCash: (0 - cashSales).toFixed(2) // No denomination data available, so difference is negative of cash sales
        },
        rawData: {
            totalOrders: orders.length,
            orders: orders.map(order => ({
                invoiceNo: order.invoiceNo,
                orderType: order.orderType,
                salesType: order.salesType,
                total: order.total,
                payableAmount: order.payableAmount,
                payments: order.payments,
                customer: order.customer,
                membership: order.membership,
                membershipStats: order.membershipStats
            }))
        }
    };
};
// ============================================================================
// COMPREHENSIVE DATA COLLECTION FUNCTIONS
// ============================================================================
/**
 * Collects comprehensive report data for multiple dates
 * Includes day-wise, shift-wise, and thermal receipt data
 * @param targetDates - Array of dates to process
 * @param branchId - Branch identifier
 * @param payload - Download request parameters
 * @returns Comprehensive report data
 */
const collectComprehensiveReportData = (targetDates, branchId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const reportData = [];
    const processedDates = new Set(); // Track processed dates to prevent duplicates
    for (const date of targetDates) {
        // Skip if this date has already been processed
        if (processedDates.has(date)) {
            console.log(`Skipping duplicate date: ${date}`);
            continue;
        }
        processedDates.add(date);
        try {
            // Get DaySales data for this date
            const daySalesData = yield day_sales_model_1.DaySales.findOne(Object.assign({ date: date }, (branchId ? { branchId } : {}))).lean();
            // Get shift data for this date
            const shiftData = yield shift_model_1.Shift.find(Object.assign({ startDate: date }, (branchId ? { branchId } : {}))).sort({ startTime: 1 }).lean();
            // Get DayClose records for this date (no-shift scenarios)
            const dayCloseData = yield day_close_model_1.DayClose.find(Object.assign({ startDate: date }, (branchId ? { branchId } : {}))).sort({ startTime: 1 }).lean();
            // Skip if no activity on this date (no shifts, no day-close records, no sales data)
            if (!daySalesData && shiftData.length === 0 && dayCloseData.length === 0) {
                console.log(`No activity found for date: ${date} - skipping`);
                continue;
            }
            console.log(`Processing date: ${date} - DaySales: ${!!daySalesData}, Shifts: ${shiftData.length}, DayCloses: ${dayCloseData.length}`);
            // Calculate shift-wise sales from actual shifts if no stored data
            let shiftWiseSales = (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.shiftWiseSales) || {
                totalOrders: 0,
                totalSales: 0,
                payments: { cash: 0, card: 0, online: 0 }
            };
            // If no stored shift-wise data, calculate from actual shifts
            if (!(daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.shiftWiseSales) && shiftData.length > 0) {
                shiftWiseSales = {
                    totalOrders: 0,
                    totalSales: 0,
                    payments: { cash: 0, card: 0, online: 0 }
                };
                shiftData.forEach(shift => {
                    var _a, _b, _c;
                    if (shift.sales) {
                        shiftWiseSales.totalOrders += shift.sales.totalOrders || 0;
                        shiftWiseSales.totalSales += shift.sales.totalSales || 0;
                        shiftWiseSales.payments.cash += ((_a = shift.sales.payments) === null || _a === void 0 ? void 0 : _a.cash) || 0;
                        shiftWiseSales.payments.card += ((_b = shift.sales.payments) === null || _b === void 0 ? void 0 : _b.card) || 0;
                        shiftWiseSales.payments.online += ((_c = shift.sales.payments) === null || _c === void 0 ? void 0 : _c.online) || 0;
                    }
                });
                console.log(`Calculated shift-wise sales for ${date}:`, shiftWiseSales);
            }
            // Calculate day-wise sales if no stored data
            let daySales = (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.daySales) || {
                totalOrders: 0,
                totalSales: 0,
                payments: { cash: 0, card: 0, online: 0 }
            };
            // If no stored day-wise data, try to calculate from shifts
            if (!(daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.daySales) && shiftData.length > 0) {
                daySales = {
                    totalOrders: 0,
                    totalSales: 0,
                    payments: { cash: 0, card: 0, online: 0 }
                };
                shiftData.forEach(shift => {
                    var _a, _b, _c;
                    if (shift.sales) {
                        daySales.totalOrders += shift.sales.totalOrders || 0;
                        daySales.totalSales += shift.sales.totalSales || 0;
                        daySales.payments.cash += ((_a = shift.sales.payments) === null || _a === void 0 ? void 0 : _a.cash) || 0;
                        daySales.payments.card += ((_b = shift.sales.payments) === null || _b === void 0 ? void 0 : _b.card) || 0;
                        daySales.payments.online += ((_c = shift.sales.payments) === null || _c === void 0 ? void 0 : _c.online) || 0;
                    }
                });
                console.log(`Calculated day-wise sales for ${date}:`, daySales);
            }
            // Build comprehensive data structure with user details
            const shiftsWithUserDetails = yield Promise.all(shiftData.map((shift) => __awaiter(void 0, void 0, void 0, function* () {
                const createdByDetails = yield populateUserDetails(shift.createdBy);
                const closedByDetails = yield populateUserDetails(shift.closedBy);
                return {
                    shiftId: shift._id.toString(),
                    shiftNumber: shift.shiftNumber,
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    status: shift.status,
                    sales: shift.sales || null,
                    denominations: shift.denominations || null,
                    createdBy: shift.createdBy,
                    closedBy: shift.closedBy,
                    createdByDetails: createdByDetails,
                    closedByDetails: closedByDetails
                };
            })));
            const dayCloseRecordsWithUserDetails = yield Promise.all(dayCloseData.map((dayClose) => __awaiter(void 0, void 0, void 0, function* () {
                const createdByDetails = yield populateUserDetails(dayClose.createdBy);
                const closedByDetails = yield populateUserDetails(dayClose.closedBy);
                return {
                    dayCloseId: dayClose._id.toString(),
                    startTime: dayClose.startTime,
                    endTime: dayClose.endTime,
                    status: dayClose.status,
                    createdBy: dayClose.createdBy,
                    closedBy: dayClose.closedBy,
                    note: dayClose.note,
                    createdByDetails: createdByDetails,
                    closedByDetails: closedByDetails
                };
            })));
            const dayReport = {
                date: date,
                daySales: daySales,
                shiftWiseSales: shiftWiseSales,
                shifts: shiftsWithUserDetails,
                dayCloseRecords: dayCloseRecordsWithUserDetails,
                dayCloseTime: (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.dayCloseTime) || null,
                closedBy: (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.closedBy) || null,
                denomination: (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.denomination) || null,
                totalShifts: (daySalesData === null || daySalesData === void 0 ? void 0 : daySalesData.totalShifts) || shiftData.length,
                // Thermal receipt data - only if we have DaySales data
                thermalReceiptData: (payload === null || payload === void 0 ? void 0 : payload.includeThermalReceipt) && daySalesData ? formatThermalReceiptFromDaySales(daySalesData, date, 'Asia/Dubai') : null
            };
            reportData.push(dayReport);
        }
        catch (error) {
            console.error(`Error processing date ${date}:`, error);
            // Continue with other dates
        }
    }
    return reportData;
});
// ============================================================================
// ENHANCED DOWNLOAD FUNCTIONS
// ============================================================================
/**
 * Downloads comprehensive reports as CSV format
 * @param reportData - Array of comprehensive report data
 * @param res - Express response object
 * @param fileName - Name for the downloaded file
 * @param payload - Download parameters
 */
const downloadEnhancedCSV = (reportData, res, fileName, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    const csvRows = [];
    // Add header row
    const headers = [
        'Date',
        'Day Close Time',
        'Closed By',
        'Total Shifts',
        'Day-wise Total Orders',
        'Day-wise Total Sales',
        'Day-wise Cash Sales',
        'Day-wise Card Sales',
        'Day-wise Online Sales',
        'Shift-wise Total Orders',
        'Shift-wise Total Sales',
        'Shift-wise Cash Sales',
        'Shift-wise Card Sales',
        'Shift-wise Online Sales',
        'Shift Details (Created By)',
        'Shift Details (Closed By)'
    ];
    if (payload.includeThermalReceipt) {
        headers.push('Total Cash Count', 'Cash Difference', 'Denomination 1000', 'Denomination 500', 'Denomination 200', 'Denomination 100', 'Denomination 50', 'Denomination 20', 'Denomination 10', 'Denomination 5', 'Denomination 2', 'Denomination 1');
    }
    csvRows.push(headers.join(','));
    // Add data rows
    for (const report of reportData) {
        // Create shift details summary
        const shiftDetails = report.shifts.map((shift) => {
            const createdBy = shift.createdByDetails ?
                `${shift.createdByDetails.name || ''} (${shift.createdByDetails.email || ''})` :
                (shift.createdBy || '');
            const closedBy = shift.closedByDetails ?
                `${shift.closedByDetails.name || ''} (${shift.closedByDetails.email || ''})` :
                (shift.closedBy || '');
            return `Shift ${shift.shiftNumber}: Created by ${createdBy}, Closed by ${closedBy}`;
        }).join('; ');
        const row = [
            report.date,
            report.dayCloseTime ? new Date(report.dayCloseTime).toISOString() : '',
            report.closedBy || '',
            report.totalShifts || 0,
            ((_a = report.daySales) === null || _a === void 0 ? void 0 : _a.totalOrders) || 0,
            ((_b = report.daySales) === null || _b === void 0 ? void 0 : _b.totalSales) || 0,
            ((_d = (_c = report.daySales) === null || _c === void 0 ? void 0 : _c.payments) === null || _d === void 0 ? void 0 : _d.cash) || 0,
            ((_f = (_e = report.daySales) === null || _e === void 0 ? void 0 : _e.payments) === null || _f === void 0 ? void 0 : _f.card) || 0,
            ((_h = (_g = report.daySales) === null || _g === void 0 ? void 0 : _g.payments) === null || _h === void 0 ? void 0 : _h.online) || 0,
            ((_j = report.shiftWiseSales) === null || _j === void 0 ? void 0 : _j.totalOrders) || 0,
            ((_k = report.shiftWiseSales) === null || _k === void 0 ? void 0 : _k.totalSales) || 0,
            ((_m = (_l = report.shiftWiseSales) === null || _l === void 0 ? void 0 : _l.payments) === null || _m === void 0 ? void 0 : _m.cash) || 0,
            ((_p = (_o = report.shiftWiseSales) === null || _o === void 0 ? void 0 : _o.payments) === null || _p === void 0 ? void 0 : _p.card) || 0,
            ((_r = (_q = report.shiftWiseSales) === null || _q === void 0 ? void 0 : _q.payments) === null || _r === void 0 ? void 0 : _r.online) || 0,
            shiftDetails
        ];
        if (payload.includeThermalReceipt && report.denomination) {
            row.push(report.denomination.totalCash || 0, ((report.denomination.totalCash || 0) - (((_t = (_s = report.daySales) === null || _s === void 0 ? void 0 : _s.payments) === null || _t === void 0 ? void 0 : _t.cash) || 0)).toFixed(2), report.denomination.denomination1000 || 0, report.denomination.denomination500 || 0, report.denomination.denomination200 || 0, report.denomination.denomination100 || 0, report.denomination.denomination50 || 0, report.denomination.denomination20 || 0, report.denomination.denomination10 || 0, report.denomination.denomination5 || 0, report.denomination.denomination2 || 0, report.denomination.denomination1 || 0);
        }
        csvRows.push(row.map(cell => `"${cell}"`).join(','));
    }
    const csv = csvRows.join('\n');
    // Set proper headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
    res.setHeader('Cache-Control', 'no-cache');
    // Send CSV content
    res.send(csv);
});
/**
 * Downloads comprehensive reports as Excel format
 * @param reportData - Array of comprehensive report data
 * @param res - Express response object
 * @param fileName - Name for the downloaded file
 * @param payload - Download parameters
 */
const downloadEnhancedExcel = (reportData, res, fileName, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new ExcelJS.Workbook();
    // Main summary sheet
    const summarySheet = workbook.addWorksheet('Day Close Summary');
    // Define columns for summary sheet
    const columns = [
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Day Close Time', key: 'dayCloseTime', width: 20 },
        { header: 'Closed By', key: 'closedBy', width: 15 },
        { header: 'Total Shifts', key: 'totalShifts', width: 12 },
        { header: 'Day-wise Orders', key: 'dayWiseOrders', width: 15 },
        { header: 'Day-wise Sales', key: 'dayWiseSales', width: 15 },
        { header: 'Day-wise Cash', key: 'dayWiseCash', width: 15 },
        { header: 'Day-wise Card', key: 'dayWiseCard', width: 15 },
        { header: 'Day-wise Online', key: 'dayWiseOnline', width: 15 },
        { header: 'Shift-wise Orders', key: 'shiftWiseOrders', width: 15 },
        { header: 'Shift-wise Sales', key: 'shiftWiseSales', width: 15 },
        { header: 'Shift-wise Cash', key: 'shiftWiseCash', width: 15 },
        { header: 'Shift-wise Card', key: 'shiftWiseCard', width: 15 },
        { header: 'Shift-wise Online', key: 'shiftWiseOnline', width: 15 }
    ];
    if (payload.includeThermalReceipt) {
        columns.push({ header: 'Total Cash Count', key: 'totalCashCount', width: 15 }, { header: 'Cash Difference', key: 'cashDifference', width: 15 });
    }
    summarySheet.columns = columns;
    // Add data to summary sheet
    reportData.forEach(report => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        summarySheet.addRow(Object.assign({ date: report.date, dayCloseTime: report.dayCloseTime ? new Date(report.dayCloseTime).toLocaleString() : '', closedBy: report.closedBy || '', totalShifts: report.totalShifts || 0, dayWiseOrders: ((_a = report.daySales) === null || _a === void 0 ? void 0 : _a.totalOrders) || 0, dayWiseSales: ((_b = report.daySales) === null || _b === void 0 ? void 0 : _b.totalSales) || 0, dayWiseCash: ((_d = (_c = report.daySales) === null || _c === void 0 ? void 0 : _c.payments) === null || _d === void 0 ? void 0 : _d.cash) || 0, dayWiseCard: ((_f = (_e = report.daySales) === null || _e === void 0 ? void 0 : _e.payments) === null || _f === void 0 ? void 0 : _f.card) || 0, dayWiseOnline: ((_h = (_g = report.daySales) === null || _g === void 0 ? void 0 : _g.payments) === null || _h === void 0 ? void 0 : _h.online) || 0, shiftWiseOrders: ((_j = report.shiftWiseSales) === null || _j === void 0 ? void 0 : _j.totalOrders) || 0, shiftWiseSales: ((_k = report.shiftWiseSales) === null || _k === void 0 ? void 0 : _k.totalSales) || 0, shiftWiseCash: ((_m = (_l = report.shiftWiseSales) === null || _l === void 0 ? void 0 : _l.payments) === null || _m === void 0 ? void 0 : _m.cash) || 0, shiftWiseCard: ((_p = (_o = report.shiftWiseSales) === null || _o === void 0 ? void 0 : _o.payments) === null || _p === void 0 ? void 0 : _p.card) || 0, shiftWiseOnline: ((_r = (_q = report.shiftWiseSales) === null || _q === void 0 ? void 0 : _q.payments) === null || _r === void 0 ? void 0 : _r.online) || 0 }, (payload.includeThermalReceipt && report.denomination ? {
            totalCashCount: report.denomination.totalCash || 0,
            cashDifference: ((report.denomination.totalCash || 0) - (((_t = (_s = report.daySales) === null || _s === void 0 ? void 0 : _s.payments) === null || _t === void 0 ? void 0 : _t.cash) || 0)).toFixed(2)
        } : {})));
    });
    // Style the header row
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };
    // Add shift details sheet if shift-wise data is requested
    if (payload.includeShiftWise) {
        const shiftSheet = workbook.addWorksheet('Shift Details');
        const shiftColumns = [
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Shift ID', key: 'shiftId', width: 25 },
            { header: 'Shift Number', key: 'shiftNumber', width: 12 },
            { header: 'Start Time', key: 'startTime', width: 20 },
            { header: 'End Time', key: 'endTime', width: 20 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Orders', key: 'orders', width: 10 },
            { header: 'Sales', key: 'sales', width: 15 },
            { header: 'Cash', key: 'cash', width: 15 },
            { header: 'Card', key: 'card', width: 15 },
            { header: 'Online', key: 'online', width: 15 },
            { header: 'Created By', key: 'createdBy', width: 15 },
            { header: 'Closed By', key: 'closedBy', width: 15 }
        ];
        shiftSheet.columns = shiftColumns;
        // Add shift data with user details
        reportData.forEach(report => {
            report.shifts.forEach((shift) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                shiftSheet.addRow({
                    date: report.date,
                    shiftId: shift.shiftId,
                    shiftNumber: shift.shiftNumber,
                    startTime: shift.startTime ? new Date(shift.startTime).toLocaleString() : '',
                    endTime: shift.endTime ? new Date(shift.endTime).toLocaleString() : '',
                    status: shift.status,
                    orders: ((_a = shift.sales) === null || _a === void 0 ? void 0 : _a.totalOrders) || 0,
                    sales: ((_b = shift.sales) === null || _b === void 0 ? void 0 : _b.totalSales) || 0,
                    cash: ((_d = (_c = shift.sales) === null || _c === void 0 ? void 0 : _c.payments) === null || _d === void 0 ? void 0 : _d.cash) || 0,
                    card: ((_f = (_e = shift.sales) === null || _e === void 0 ? void 0 : _e.payments) === null || _f === void 0 ? void 0 : _f.card) || 0,
                    online: ((_h = (_g = shift.sales) === null || _g === void 0 ? void 0 : _g.payments) === null || _h === void 0 ? void 0 : _h.online) || 0,
                    createdBy: shift.createdByDetails ?
                        `${shift.createdByDetails.name || ''} (${shift.createdByDetails.email || ''})` :
                        (shift.createdBy || ''),
                    closedBy: shift.closedByDetails ?
                        `${shift.closedByDetails.name || ''} (${shift.closedByDetails.email || ''})` :
                        (shift.closedBy || '')
                });
            });
        });
        // Style the header row
        shiftSheet.getRow(1).font = { bold: true };
        shiftSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
    }
    // Add thermal receipt data sheet if requested
    if (payload.includeThermalReceipt) {
        const thermalSheet = workbook.addWorksheet('Thermal Receipt Data');
        const thermalColumns = [
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Business Name', key: 'businessName', width: 20 },
            { header: 'Location', key: 'location', width: 15 },
            { header: 'Report Date', key: 'reportDate', width: 15 },
            { header: 'Report Time', key: 'reportTime', width: 15 },
            { header: 'Cashier', key: 'cashier', width: 15 },
            { header: 'Total Pax', key: 'totalPax', width: 12 },
            { header: 'Total Invoice Amount', key: 'totalInvoiceAmount', width: 18 },
            { header: 'Total Discount Amount', key: 'totalDiscountAmount', width: 20 },
            { header: 'Net Sales Amount', key: 'netSalesAmount', width: 18 },
            { header: 'VAT Amount', key: 'vatAmount', width: 15 },
            { header: 'Grand Total', key: 'grandTotal', width: 15 },
            { header: 'Restaurant Sales', key: 'restaurantSales', width: 18 },
            { header: 'Membership Meal', key: 'membershipMeal', width: 18 },
            { header: 'Cash Sales Amount', key: 'cashSalesAmount', width: 18 },
            { header: 'Credit Card Amount', key: 'creditCardAmount', width: 20 },
            { header: 'Online Sales Amount', key: 'onlineSalesAmount', width: 20 },
            { header: 'Total Collection', key: 'totalCollection', width: 18 },
            { header: 'Total Cash Count', key: 'totalCashCount', width: 18 },
            { header: 'Cash Difference', key: 'cashDifference', width: 18 }
        ];
        thermalSheet.columns = thermalColumns;
        // Add thermal receipt data
        reportData.forEach(report => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
            if (report.thermalReceiptData) {
                const thermal = report.thermalReceiptData;
                thermalSheet.addRow({
                    date: report.date,
                    businessName: ((_a = thermal.header) === null || _a === void 0 ? void 0 : _a.businessName) || '',
                    location: ((_b = thermal.header) === null || _b === void 0 ? void 0 : _b.location) || '',
                    reportDate: ((_c = thermal.header) === null || _c === void 0 ? void 0 : _c.date) || '',
                    reportTime: ((_d = thermal.header) === null || _d === void 0 ? void 0 : _d.time) || '',
                    cashier: ((_e = thermal.shiftDetails) === null || _e === void 0 ? void 0 : _e.cashier) || '',
                    totalPax: ((_f = thermal.shiftDetails) === null || _f === void 0 ? void 0 : _f.totalPax) || 0,
                    totalInvoiceAmount: ((_g = thermal.summary) === null || _g === void 0 ? void 0 : _g.totalInvoiceAmount) || 0,
                    totalDiscountAmount: ((_h = thermal.summary) === null || _h === void 0 ? void 0 : _h.totalDiscountAmount) || 0,
                    netSalesAmount: ((_j = thermal.summary) === null || _j === void 0 ? void 0 : _j.netSalesAmount) || 0,
                    vatAmount: ((_k = thermal.summary) === null || _k === void 0 ? void 0 : _k.vatAmount) || 0,
                    grandTotal: ((_l = thermal.summary) === null || _l === void 0 ? void 0 : _l.grandTotal) || 0,
                    restaurantSales: ((_m = thermal.salesDetails) === null || _m === void 0 ? void 0 : _m.restaurantSales) || 0,
                    membershipMeal: ((_o = thermal.salesDetails) === null || _o === void 0 ? void 0 : _o.membershipMeal) || 0,
                    cashSalesAmount: ((_p = thermal.collectionDetails) === null || _p === void 0 ? void 0 : _p.cashSalesAmount) || 0,
                    creditCardAmount: ((_q = thermal.collectionDetails) === null || _q === void 0 ? void 0 : _q.creditCardAmount) || 0,
                    onlineSalesAmount: ((_r = thermal.collectionDetails) === null || _r === void 0 ? void 0 : _r.onlineSalesAmount) || 0,
                    totalCollection: ((_s = thermal.collectionDetails) === null || _s === void 0 ? void 0 : _s.totalCollection) || 0,
                    totalCashCount: ((_t = thermal.denomination) === null || _t === void 0 ? void 0 : _t.totalAmount) || 0,
                    cashDifference: ((_u = thermal.difference) === null || _u === void 0 ? void 0 : _u.totalDifferenceInCash) || 0
                });
            }
        });
        // Style the header row
        thermalSheet.getRow(1).font = { bold: true };
        thermalSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
    }
    const buffer = yield workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.send(buffer);
});
/**
 * Downloads comprehensive reports as PDF format
 * @param reportData - Array of comprehensive report data
 * @param res - Express response object
 * @param fileName - Name for the downloaded file
 * @param payload - Download parameters
 */
const downloadEnhancedPDF = (reportData, res, fileName, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create comprehensive HTML content for PDF generation
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Day Close Reports - Comprehensive</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
            line-height: 1.4;
          }
          h1 { 
            color: #333; 
            text-align: center; 
            margin-bottom: 20px;
            font-size: 24px;
          }
          h2 {
            color: #555;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 18px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 5px;
          }
          .header-info {
            text-align: center;
            margin-bottom: 30px;
            color: #666;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            font-size: 10px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
            vertical-align: top;
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold; 
            font-size: 11px;
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          .summary-stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <h1>Day Close Reports - Comprehensive</h1>
        <div class="header-info">
          <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Days:</strong> ${reportData.length}</p>
          <p><strong>Data Types:</strong> ${[
            payload.includeDayWise ? 'Day-wise' : '',
            payload.includeShiftWise ? 'Shift-wise' : '',
            payload.includeThermalReceipt ? 'Thermal Receipt' : ''
        ].filter(Boolean).join(', ')}</p>
        </div>

        <div class="summary-stats">
          <div class="stat-item">
            <div class="stat-value">${reportData.reduce((sum, r) => { var _a; return sum + (((_a = r.daySales) === null || _a === void 0 ? void 0 : _a.totalOrders) || 0); }, 0)}</div>
            <div class="stat-label">Total Orders</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">₹${reportData.reduce((sum, r) => { var _a; return sum + (((_a = r.daySales) === null || _a === void 0 ? void 0 : _a.totalSales) || 0); }, 0).toFixed(2)}</div>
            <div class="stat-label">Total Sales</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${reportData.reduce((sum, r) => sum + (r.totalShifts || 0), 0)}</div>
            <div class="stat-label">Total Shifts</div>
          </div>
        </div>

        <h2>Day-wise Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day Close Time</th>
              <th>Closed By</th>
              <th>Total Shifts</th>
              <th>Day-wise Orders</th>
              <th>Day-wise Sales</th>
              <th>Day-wise Cash</th>
              <th>Day-wise Card</th>
              <th>Day-wise Online</th>
              <th>Shift-wise Orders</th>
              <th>Shift-wise Sales</th>
              <th>Shift-wise Cash</th>
              <th>Shift-wise Card</th>
              <th>Shift-wise Online</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.map(report => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            return `
              <tr>
                <td>${report.date}</td>
                <td>${report.dayCloseTime ? new Date(report.dayCloseTime).toLocaleString() : '-'}</td>
                <td>${report.closedBy || '-'}</td>
                <td>${report.totalShifts || 0}</td>
                <td>${((_a = report.daySales) === null || _a === void 0 ? void 0 : _a.totalOrders) || 0}</td>
                <td>₹${(((_b = report.daySales) === null || _b === void 0 ? void 0 : _b.totalSales) || 0).toFixed(2)}</td>
                <td>₹${(((_d = (_c = report.daySales) === null || _c === void 0 ? void 0 : _c.payments) === null || _d === void 0 ? void 0 : _d.cash) || 0).toFixed(2)}</td>
                <td>₹${(((_f = (_e = report.daySales) === null || _e === void 0 ? void 0 : _e.payments) === null || _f === void 0 ? void 0 : _f.card) || 0).toFixed(2)}</td>
                <td>₹${(((_h = (_g = report.daySales) === null || _g === void 0 ? void 0 : _g.payments) === null || _h === void 0 ? void 0 : _h.online) || 0).toFixed(2)}</td>
                <td>${((_j = report.shiftWiseSales) === null || _j === void 0 ? void 0 : _j.totalOrders) || 0}</td>
                <td>₹${(((_k = report.shiftWiseSales) === null || _k === void 0 ? void 0 : _k.totalSales) || 0).toFixed(2)}</td>
                <td>₹${(((_m = (_l = report.shiftWiseSales) === null || _l === void 0 ? void 0 : _l.payments) === null || _m === void 0 ? void 0 : _m.cash) || 0).toFixed(2)}</td>
                <td>₹${(((_p = (_o = report.shiftWiseSales) === null || _o === void 0 ? void 0 : _o.payments) === null || _p === void 0 ? void 0 : _p.card) || 0).toFixed(2)}</td>
                <td>₹${(((_r = (_q = report.shiftWiseSales) === null || _q === void 0 ? void 0 : _q.payments) === null || _r === void 0 ? void 0 : _r.online) || 0).toFixed(2)}</td>
              </tr>
            `;
        }).join('')}
          </tbody>
        </table>

        ${payload.includeShiftWise ? `
        <div class="page-break"></div>
        <h2>Shift Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Shift Number</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Orders</th>
              <th>Sales</th>
              <th>Cash</th>
              <th>Card</th>
              <th>Online</th>
              <th>Created By</th>
              <th>Closed By</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.map(report => report.shifts.map((shift) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return `
                <tr>
                  <td>${report.date}</td>
                  <td>${shift.shiftNumber}</td>
                  <td>${shift.startTime ? new Date(shift.startTime).toLocaleString() : '-'}</td>
                  <td>${shift.endTime ? new Date(shift.endTime).toLocaleString() : '-'}</td>
                  <td>${shift.status}</td>
                  <td>${((_a = shift.sales) === null || _a === void 0 ? void 0 : _a.totalOrders) || 0}</td>
                  <td>₹${(((_b = shift.sales) === null || _b === void 0 ? void 0 : _b.totalSales) || 0).toFixed(2)}</td>
                  <td>₹${(((_d = (_c = shift.sales) === null || _c === void 0 ? void 0 : _c.payments) === null || _d === void 0 ? void 0 : _d.cash) || 0).toFixed(2)}</td>
                  <td>₹${(((_f = (_e = shift.sales) === null || _e === void 0 ? void 0 : _e.payments) === null || _f === void 0 ? void 0 : _f.card) || 0).toFixed(2)}</td>
                  <td>₹${(((_h = (_g = shift.sales) === null || _g === void 0 ? void 0 : _g.payments) === null || _h === void 0 ? void 0 : _h.online) || 0).toFixed(2)}</td>
                  <td>${shift.createdByDetails ?
                `${shift.createdByDetails.name || ''} (${shift.createdByDetails.email || ''})` :
                (shift.createdBy || '-')}</td>
                  <td>${shift.closedByDetails ?
                `${shift.closedByDetails.name || ''} (${shift.closedByDetails.email || ''})` :
                (shift.closedBy || '-')}</td>
                </tr>
              `;
        }).join('')).join('')}
          </tbody>
        </table>
        ` : ''}

        ${payload.includeThermalReceipt ? `
        <div class="page-break"></div>
        <h2>Thermal Receipt Data</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Business Name</th>
              <th>Location</th>
              <th>Report Date</th>
              <th>Report Time</th>
              <th>Cashier</th>
              <th>Total Pax</th>
              <th>Total Invoice Amount</th>
              <th>Total Discount Amount</th>
              <th>Net Sales Amount</th>
              <th>VAT Amount</th>
              <th>Grand Total</th>
              <th>Restaurant Sales</th>
              <th>Membership Meal</th>
              <th>Cash Sales Amount</th>
              <th>Credit Card Amount</th>
              <th>Online Sales Amount</th>
              <th>Total Collection</th>
              <th>Total Cash Count</th>
              <th>Cash Difference</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.map(report => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
            if (report.thermalReceiptData) {
                const thermal = report.thermalReceiptData;
                return `
                  <tr>
                    <td>${report.date}</td>
                    <td>${((_a = thermal.header) === null || _a === void 0 ? void 0 : _a.businessName) || '-'}</td>
                    <td>${((_b = thermal.header) === null || _b === void 0 ? void 0 : _b.location) || '-'}</td>
                    <td>${((_c = thermal.header) === null || _c === void 0 ? void 0 : _c.date) || '-'}</td>
                    <td>${((_d = thermal.header) === null || _d === void 0 ? void 0 : _d.time) || '-'}</td>
                    <td>${((_e = thermal.shiftDetails) === null || _e === void 0 ? void 0 : _e.cashier) || '-'}</td>
                    <td>${((_f = thermal.shiftDetails) === null || _f === void 0 ? void 0 : _f.totalPax) || 0}</td>
                    <td>₹${((_g = thermal.summary) === null || _g === void 0 ? void 0 : _g.totalInvoiceAmount) || 0}</td>
                    <td>₹${((_h = thermal.summary) === null || _h === void 0 ? void 0 : _h.totalDiscountAmount) || 0}</td>
                    <td>₹${((_j = thermal.summary) === null || _j === void 0 ? void 0 : _j.netSalesAmount) || 0}</td>
                    <td>₹${((_k = thermal.summary) === null || _k === void 0 ? void 0 : _k.vatAmount) || 0}</td>
                    <td>₹${((_l = thermal.summary) === null || _l === void 0 ? void 0 : _l.grandTotal) || 0}</td>
                    <td>₹${((_m = thermal.salesDetails) === null || _m === void 0 ? void 0 : _m.restaurantSales) || 0}</td>
                    <td>₹${((_o = thermal.salesDetails) === null || _o === void 0 ? void 0 : _o.membershipMeal) || 0}</td>
                    <td>₹${((_p = thermal.collectionDetails) === null || _p === void 0 ? void 0 : _p.cashSalesAmount) || 0}</td>
                    <td>₹${((_q = thermal.collectionDetails) === null || _q === void 0 ? void 0 : _q.creditCardAmount) || 0}</td>
                    <td>₹${((_r = thermal.collectionDetails) === null || _r === void 0 ? void 0 : _r.onlineSalesAmount) || 0}</td>
                    <td>₹${((_s = thermal.collectionDetails) === null || _s === void 0 ? void 0 : _s.totalCollection) || 0}</td>
                    <td>₹${((_t = thermal.denomination) === null || _t === void 0 ? void 0 : _t.totalAmount) || 0}</td>
                    <td>₹${((_u = thermal.difference) === null || _u === void 0 ? void 0 : _u.totalDifferenceInCash) || 0}</td>
                  </tr>
                `;
            }
            return '';
        }).join('')}
          </tbody>
        </table>
        ` : ''}
        
        <div class="footer">
          <p>This comprehensive report was generated automatically by the Day Close Report System</p>
          <p>Includes: ${[
            payload.includeDayWise ? 'Day-wise data' : '',
            payload.includeShiftWise ? 'Shift-wise data' : '',
            payload.includeThermalReceipt ? 'Thermal receipt data' : ''
        ].filter(Boolean).join(', ')}</p>
        </div>
      </body>
      </html>
    `;
        // Launch Puppeteer browser
        const browser = yield puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = yield browser.newPage();
        // Set content and generate PDF
        yield page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = yield page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        });
        yield browser.close();
        // Set proper headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        res.setHeader('Cache-Control', 'no-cache');
        // Send PDF buffer
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Enhanced PDF generation error:', error);
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Failed to generate enhanced PDF file'
        });
    }
});
// ============================================================================
// HELPER FUNCTIONS FOR FILE DOWNLOADS
// ============================================================================
/**
 * Downloads reports as CSV format
 * @param reports - Array of report data
 * @param res - Express response object
 * @param fileName - Name for the downloaded file
 */
const downloadCSV = (reports, res, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const csvData = reports.map(report => ({
        'Start Date': report.startDate,
        'Start Time': report.startTime,
        'End Date': report.endDate || '',
        'End Time': report.endTime || '',
        'Status': report.status,
        'Branch ID': report.branchId || '',
        'Created By': report.createdBy || '',
        'Closed By': report.closedBy || '',
        'Note': report.note || '',
        'Created At': report.createdAt,
        'Updated At': report.updatedAt
    }));
    const csv = convertToCSV(csvData);
    // Set proper headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
    res.setHeader('Cache-Control', 'no-cache');
    // Send CSV content
    res.send(csv);
});
/**
 * Downloads reports as Excel format
 * @param reports - Array of report data
 * @param res - Express response object
 * @param fileName - Name for the downloaded file
 */
const downloadExcel = (reports, res, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Day Close Reports');
    // Add headers
    worksheet.columns = [
        { header: 'Start Date', key: 'startDate', width: 12 },
        { header: 'Start Time', key: 'startTime', width: 20 },
        { header: 'End Date', key: 'endDate', width: 12 },
        { header: 'End Time', key: 'endTime', width: 20 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Branch ID', key: 'branchId', width: 15 },
        { header: 'Created By', key: 'createdBy', width: 15 },
        { header: 'Closed By', key: 'closedBy', width: 15 },
        { header: 'Note', key: 'note', width: 30 }
    ];
    // Add data rows
    reports.forEach(report => {
        const serializedReport = serializeDayClose(report);
        worksheet.addRow({
            startDate: serializedReport.startDate,
            startTime: serializedReport.startTime,
            endDate: serializedReport.endDate || '',
            endTime: serializedReport.endTime || '',
            status: serializedReport.status,
            branchId: serializedReport.branchId || '',
            createdBy: serializedReport.createdBy || '',
            closedBy: serializedReport.closedBy || '',
            note: serializedReport.note || ''
        });
    });
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };
    const buffer = yield workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.send(buffer);
});
/**
 * Downloads reports as PDF format using Puppeteer
 * @param reports - Array of report data
 * @param res - Express response object
 * @param fileName - Name for the downloaded file
 */
const downloadPDF = (reports, res, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create HTML content for PDF generation
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Day Close Reports</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
            line-height: 1.4;
          }
          h1 { 
            color: #333; 
            text-align: center; 
            margin-bottom: 20px;
            font-size: 24px;
          }
          .header-info {
            text-align: center;
            margin-bottom: 30px;
            color: #666;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            font-size: 10px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
            vertical-align: top;
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold; 
            font-size: 11px;
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          .status-badge {
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
          }
          .status-badge.day-close {
            background-color: #28a745;
          }
          .status-badge.closed {
            background-color: #6c757d;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Day Close Reports</h1>
        <div class="header-info">
          <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Reports:</strong> ${reports.length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Start Date</th>
              <th>Start Time</th>
              <th>End Date</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Branch ID</th>
              <th>Created By</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${reports.map(report => {
            const serializedReport = serializeDayClose(report);
            return `
                <tr>
                  <td>${serializedReport.startDate || '-'}</td>
                  <td>${serializedReport.startTime ? new Date(serializedReport.startTime).toLocaleString() : '-'}</td>
                  <td>${serializedReport.endDate || '-'}</td>
                  <td>${serializedReport.endTime ? new Date(serializedReport.endTime).toLocaleString() : '-'}</td>
                  <td><span class="status-badge ${serializedReport.status}">${serializedReport.status}</span></td>
                  <td>${serializedReport.branchId || '-'}</td>
                  <td>${serializedReport.createdBy || '-'}</td>
                  <td>${serializedReport.note || '-'}</td>
                </tr>
              `;
        }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This report was generated automatically by the Day Close Report System</p>
        </div>
      </body>
      </html>
    `;
        // Launch Puppeteer browser
        const browser = yield puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = yield browser.newPage();
        // Set content and generate PDF
        yield page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = yield page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        });
        yield browser.close();
        // Set proper headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        res.setHeader('Cache-Control', 'no-cache');
        // Send PDF buffer
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Failed to generate PDF file'
        });
    }
});
/**
 * Converts data array to CSV format
 * @param data - Array of objects to convert
 * @returns CSV string
 */
const convertToCSV = (data) => {
    if (data.length === 0)
        return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined)
                return '';
            // Convert to string and handle special characters
            const stringValue = String(value);
            // If value contains comma, newline, or quote, wrap in quotes and escape quotes
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"') || stringValue.includes('\r')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
};
