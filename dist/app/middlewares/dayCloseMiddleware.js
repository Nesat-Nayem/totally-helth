"use strict";
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
exports.dayCloseMiddleware = void 0;
const shift_model_1 = require("../modules/shift/shift.model");
const day_close_model_1 = require("../modules/day-close-report/day-close.model");
/**
 * Middleware to check if day is closed and move orders to next day
 */
const dayCloseMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log('🚀 Day close middleware started');
        const reqUser = req;
        const branchId = reqUser.branchId;
        console.log(`📍 Branch ID: ${branchId}`);
        console.log(`📅 Request body date: ${(_a = req.body) === null || _a === void 0 ? void 0 : _a.date}`);
        // Get order date from request - check multiple possible fields
        let orderDate = ((_b = req.body) === null || _b === void 0 ? void 0 : _b.date) || ((_c = req.body) === null || _c === void 0 ? void 0 : _c.startDate) || ((_d = req.body) === null || _d === void 0 ? void 0 : _d.endDate);
        if (!orderDate) {
            // If no date provided, use current date
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            orderDate = `${year}-${month}-${day}`;
            req.body.date = orderDate;
            console.log(`📅 No date provided, using current date: ${orderDate}`);
        }
        console.log(`📅 Final order date: ${orderDate}`);
        // Check if the day is closed
        const isDayClosed = yield checkIfDayClosed(orderDate, branchId);
        console.log(`🔍 Day ${orderDate} is closed: ${isDayClosed}`);
        if (isDayClosed) {
            // Move order to next day
            const nextDay = getNextDay(orderDate);
            req.body.date = nextDay;
            req.body.startDate = nextDay;
            req.body.endDate = nextDay;
            // Move timestamps to next day as well
            const nextDayDate = new Date(nextDay + 'T00:00:00.000Z');
            req.body.createdAt = nextDayDate;
            req.body.updatedAt = nextDayDate;
            // Add note about date change
            const originalNote = req.body.note || '';
            req.body.note = `${originalNote} [Order moved from ${orderDate} to ${nextDay} - day was closed]`.trim();
            console.log(`📅 Order moved from ${orderDate} to ${nextDay}`);
            console.log(`📅 Timestamps moved to: ${nextDayDate.toISOString()}`);
            console.log(`📅 Updated request body:`, {
                date: req.body.date,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                createdAt: req.body.createdAt,
                updatedAt: req.body.updatedAt,
                note: req.body.note
            });
        }
        else {
            console.log(`✅ Day ${orderDate} is open for orders`);
        }
        console.log('✅ Day close middleware completed');
        next();
    }
    catch (error) {
        console.error('❌ Day close middleware error:', error);
        next(); // Continue even if middleware fails
    }
});
exports.dayCloseMiddleware = dayCloseMiddleware;
/**
 * Check if a day is closed
 */
function checkIfDayClosed(date, branchId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`🔍 Checking if day ${date} is closed for branch: ${branchId || 'default'}`);
            // Check Shift records with day-close status
            const dayClosedShift = yield shift_model_1.Shift.findOne(Object.assign({ status: 'day-close', startDate: date }, (branchId ? { branchId } : {})));
            // Check DayClose records
            const dayCloseRecord = yield day_close_model_1.DayClose.findOne(Object.assign({ status: 'day-close', startDate: date }, (branchId ? { branchId } : {})));
            const isClosed = !!(dayClosedShift || dayCloseRecord);
            console.log(`📊 Day close check results:`);
            console.log(`   - Day closed shift found: ${!!dayClosedShift}`);
            console.log(`   - Day close record found: ${!!dayCloseRecord}`);
            console.log(`   - Day is closed: ${isClosed}`);
            if (dayClosedShift) {
                console.log(`   - Shift ID: ${dayClosedShift._id}, Status: ${dayClosedShift.status}`);
            }
            if (dayCloseRecord) {
                console.log(`   - DayClose ID: ${dayCloseRecord._id}, Status: ${dayCloseRecord.status}`);
            }
            return isClosed;
        }
        catch (error) {
            console.error('❌ Error checking day close:', error);
            return false;
        }
    });
}
/**
 * Get next day from given date
 */
function getNextDay(date) {
    const currentDate = new Date(date + 'T00:00:00.000Z');
    currentDate.setDate(currentDate.getDate() + 1);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
