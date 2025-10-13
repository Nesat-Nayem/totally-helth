/**
 * Shift Management Controller
 * 
 * Handles shift operations including opening, closing, and day close functionality.
 * Manages cash denominations and provides comprehensive shift tracking.
 * 
 * @author API Team
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { Shift } from './shift.model';
import { 
  shiftStartValidation, 
  shiftCloseValidation, 
  shiftQueryValidation, 
  emailShiftValidation, 
  dayCloseActionValidation 
} from './shift.validation';
import { userInterface } from '../../middlewares/userInterface';
import { calculateSales } from './sales.service';
import { DayClose } from '../day-close-report/day-close.model';
import { DaySales } from '../day-close-report/day-sales.model';
import { User } from '../auth/auth.model';
import { Order } from '../order/order.model';

// Default timezone for date operations
const DEFAULT_TIMEZONE = 'Asia/Dubai';

/**
 * Populates user details (name, email, phone) based on user ID
 * @param userId - User ID to fetch details for
 * @returns User details object or null if not found
 */
const populateUserDetails = async (userId?: string): Promise<{ name?: string; email?: string; phone?: string } | null> => {
  if (!userId) return null;
  
  try {
    const user = await User.findById(userId).select('name email phone').lean();
    return user ? {
      name: user.name,
      email: user.email,
      phone: user.phone
    } : null;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

/**
 * Formats a date to YYYY-MM-DD format in specified timezone
 * @param date - Date to format
 * @param timezone - Timezone to use (defaults to Asia/Dubai)
 * @returns Formatted date string
 */
const formatYMD = (date: Date, timezone: string = DEFAULT_TIMEZONE): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') lookup[part.type] = part.value;
  }
  
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
};

/**
 * Ensures a valid date object from various input types
 * @param value - Date value to validate
 * @returns Valid Date object
 * @throws Error if date is invalid
 */
const ensureDate = (value?: string | Date | null): Date => {
  if (!value) return new Date();
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
const calculateShiftDates = (startTime: Date, endTime: Date, timezone: string = DEFAULT_TIMEZONE) => {
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
const isDayClosed = async (date: string, branchId?: string): Promise<boolean> => {
  const dayClosedShift = await Shift.findOne({ 
    status: 'day-close', 
    startDate: date,
    ...(branchId ? { branchId } : {}) 
  });
  return !!dayClosedShift;
};

/**
 * Checks for unpaid orders on a specific date
 * @param date - Date to check (YYYY-MM-DD format)
 * @param branchId - Branch ID to check
 * @returns Promise<{hasUnpaidOrders: boolean, unpaidOrders: any[]}> - Object containing unpaid orders info
 */
const checkUnpaidOrders = async (date: string, branchId?: string): Promise<{hasUnpaidOrders: boolean, unpaidOrders: any[]}> => {
  try {
    // Create date range for the entire day
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    
    const filter: any = {
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'unpaid',
      canceled: { $ne: true }, // Exclude canceled orders
      isDeleted: { $ne: true } // Exclude deleted orders
    };
    
    if (branchId) filter.branchId = branchId;
    
    const unpaidOrders = await Order.find(filter)
      .select('_id invoiceNo orderNo customer total payableAmount dueAmount date')
      .lean();
    
    return {
      hasUnpaidOrders: unpaidOrders.length > 0,
      unpaidOrders: unpaidOrders
    };
  } catch (error) {
    console.error('Error checking unpaid orders:', error);
    return { hasUnpaidOrders: false, unpaidOrders: [] };
  }
};

/**
 * Serializes a shift document for API response
 * @param doc - Shift document to serialize
 * @param createdByDetails - User details for createdBy
 * @param closedByDetails - User details for closedBy
 * @returns Serialized shift object with ISO date strings and user details
 */
const serializeShift = (doc: any, createdByDetails?: any, closedByDetails?: any): any => {
  if (!doc) return doc;
  
  const obj = typeof doc.toObject === 'function' 
    ? doc.toObject({ versionKey: false }) 
    : { ...doc };
    
  // Convert dates to ISO strings
  if (obj.startTime instanceof Date) obj.startTime = obj.startTime.toISOString();
  if (obj.endTime instanceof Date) obj.endTime = obj.endTime.toISOString();
  if (obj.logoutTime instanceof Date) obj.logoutTime = obj.logoutTime.toISOString();
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
const calculateDenominationTotal = (denominations: any): number => {
  if (!denominations) return 0;
  
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
const createDenominationData = (denominationData?: any) => {
  const denomination = {
    denomination1000: denominationData?.denomination1000 || 0,
    denomination500: denominationData?.denomination500 || 0,
    denomination200: denominationData?.denomination200 || 0,
    denomination100: denominationData?.denomination100 || 0,
    denomination50: denominationData?.denomination50 || 0,
    denomination20: denominationData?.denomination20 || 0,
    denomination10: denominationData?.denomination10 || 0,
    denomination5: denominationData?.denomination5 || 0,
    denomination2: denominationData?.denomination2 || 0,
    denomination1: denominationData?.denomination1 || 0,
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
const parseDateTime = (dateStr: string, timeStr: string): Date => {
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
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
    } else {
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
  } catch (error: any) {
    throw new Error(`Invalid date value: ${dateStr} ${timeStr}`);
  }
};

/**
 * Starts a new shift
 * @param req - Express request object
 * @param res - Express response object
 */
export const openShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = shiftStartValidation.parse(req.body || {});
    const reqUser = req as userInterface;
    const branchId = reqUser.branchId;
    const userId = (reqUser.user as any)?._id?.toString();
    const timezone = reqUser.timezone || DEFAULT_TIMEZONE;

    // Get current date in user's timezone
    const currentDate = payload.loginDate || formatYMD(new Date(), timezone);

    // Check if day close has been performed for the current date
    if (await isDayClosed(currentDate, branchId)) {
      const dayClosedShift = await Shift.findOne({ 
        status: 'day-close', 
        startDate: currentDate,
        ...(branchId ? { branchId } : {}) 
      });
      
      res.status(400).json({ 
        success: false,
        statusCode: 400,
        message: 'Day close has been performed for today. New shifts can only be started from tomorrow onwards.',
        dayCloseTime: dayClosedShift?.endTime,
        closedBy: dayClosedShift?.closedBy
      });
      return;
    }

    // Check if there's already an open shift for this branch
    const existing = await Shift.findOne({ 
      status: 'open', 
      ...(branchId ? { branchId } : {}) 
    });
    
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
    const lastShift = await Shift.findOne({ 
      startDate: startDate,
      ...(branchId ? { branchId } : {}) 
    })
      .sort({ shiftNumber: -1 })
      .lean();
    const nextShiftNumber = (lastShift?.shiftNumber || 0) + 1;

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
    } else if (payload.logoutTime) {
      // Use provided scheduled end time with start date
      endTime = parseDateTime(startDate, payload.logoutTime);
      endDate = startDate;
    }
    // If no logout time provided, endTime and endDate remain undefined (open-ended shift)

    const shift = await Shift.create({
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
    const createdByDetails = await populateUserDetails(userId);

    res.status(201).json({ 
      success: true,
      statusCode: 201,
      message: 'Shift started', 
      data: serializeShift(shift, createdByDetails) 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      statusCode: 400,
      message: error?.message || 'Failed to start shift' 
    });
  }
};

/**
 * Closes the current shift with cash denominations
 * @param req - Express request object
 * @param res - Express response object
 */
export const closeShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = shiftCloseValidation.parse(req.body || {});
    const reqUser = req as userInterface;
    const userId = (reqUser.user as any)?._id?.toString();
    const branchId = reqUser.branchId;
    const timezone = reqUser.timezone || DEFAULT_TIMEZONE;

    // Find the open shift for this branch
    const shift = await Shift.findOne({ 
      status: 'open', 
      ...(branchId ? { branchId } : {}) 
    });

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
    let logoutTime: Date;
    let logoutDate: string;
    
    if (payload.logoutTime && payload.logoutDate) {
      // Use provided logout time and date (for backdating or rescheduling)
      logoutTime = parseDateTime(payload.logoutDate, payload.logoutTime);
      logoutDate = payload.logoutDate;
    } else if (payload.logoutTime) {
      // Use provided logout time with current date
      const currentDate = formatYMD(new Date(), timezone);
      logoutTime = parseDateTime(currentDate, payload.logoutTime);
      logoutDate = currentDate;
    } else {
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
      shift.denominations = {
        ...payload.denominations,
        totalCash: totalCash
      };
    } else {
      // Ensure denominations are initialized if not provided
      if (!shift.denominations) {
        shift.denominations = initializeDenominations();
      }
    }

    // Calculate and store sales data for this shift
    try {
      const salesData = await calculateSales(shift.startTime, logoutTime, branchId);
      shift.sales = salesData;
    } catch (error) {
      console.error('❌ Error calculating sales:', error);
    }

    await shift.save();

    // Get user details for createdBy and closedBy
    const createdByDetails = await populateUserDetails(shift.createdBy);
    const closedByDetails = await populateUserDetails(userId);

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
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      statusCode: 400,
      message: error?.message || 'Failed to close shift' 
    });
  }
};


/**
 * Performs day close - closes all open shifts for the current day
 * If no shifts exist, creates a day-close record for the whole day
 * @param req - Express request object
 * @param res - Express response object
 */
export const dayClose = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = dayCloseActionValidation.parse(req.body || {});
    const reqUser = req as userInterface;
    const userId = (reqUser.user as any)?._id?.toString();
    const branchId = reqUser.branchId;
    const timezone = reqUser.timezone || DEFAULT_TIMEZONE;

    // Get current date in user's timezone
    const currentDate = formatYMD(new Date(), timezone);
    const now = new Date();

    // Check if day close has already been performed for this date
    const existingDayClose = await DayClose.findOne({
      status: 'day-close',
      startDate: currentDate,
      ...(branchId ? { branchId } : {})
    });

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
    const existingDayCloseShifts = await Shift.find({
      startDate: currentDate,
      status: 'day-close',
      ...(branchId ? { branchId } : {})
    });

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

    // Check for unpaid orders before allowing day close
    const unpaidOrdersCheck = await checkUnpaidOrders(currentDate, branchId);
    
    if (unpaidOrdersCheck.hasUnpaidOrders) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Cannot close the day. There are unpaid orders that need to be settled first.',
        unpaidOrdersCount: unpaidOrdersCheck.unpaidOrders.length,
        unpaidOrders: unpaidOrdersCheck.unpaidOrders.map(order => ({
          id: order._id,
          invoiceNo: order.invoiceNo,
          orderNo: order.orderNo,
          customerName: order.customer?.name || 'N/A',
          total: order.total,
          payableAmount: order.payableAmount,
          dueAmount: order.dueAmount,
          date: order.date
        })),
        actionRequired: 'Please mark all orders as paid before closing the day'
      });
      return;
    }

    // Find all open shifts for the current day
    const shiftsToClose = await Shift.find({ 
      startDate: currentDate,
      status: { $in: ['open', 'closed'] }, // Close both open and closed shifts
      ...(branchId ? { branchId } : {}) 
    });

    // If no shifts exist, create only DayClose record (no shift records)
    if (shiftsToClose.length === 0) {
      // Calculate day sales data for the whole day
      let daySalesData = null;
      try {
        const startOfDay = new Date(currentDate + 'T00:00:00.000Z');
        const endOfDay = new Date(currentDate + 'T23:59:59.999Z');
        daySalesData = await calculateSales(startOfDay, endOfDay, branchId);
      } catch (error) {
        console.error('❌ Error calculating day sales:', error);
      }

      // Create DayClose record for the whole day (no shift records needed)
      try {
        const dayCloseRecord = new DayClose({
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

        await dayCloseRecord.save();
      } catch (error) {
        console.error('❌ Error saving day close record:', error);
      }

      // Save day sales data to DaySales schema
      try {
        const daySalesRecord = new DaySales({
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
          denomination: createDenominationData(payload.denomination || payload.denominations)
        });

        await daySalesRecord.save();
      } catch (error) {
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
            totalOrders: daySalesData?.totalOrders || 0,
            totalSales: daySalesData?.totalSales || 0,
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
      daySalesData = await calculateSales(startOfDay, endOfDay, branchId);
    } catch (error) {
      console.error('❌ Error calculating day sales:', error);
    }

    // Calculate shift-wise totals
    const shiftWiseTotals: {
      totalShifts: number;
      totalOrders: number;
      totalSales: number;
      totalPayments: {
        cash: number;
        card: number;
        online: number;
      };
      shifts: any[];
    } = {
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
          const salesData = await calculateSales(shift.startTime, now, branchId);
          shift.sales = salesData;
        } catch (error) {
          console.error('❌ Error calculating sales during day close:', error);
        }
      }

      // Add to shift-wise totals
      if (shift.sales) {
        shiftWiseTotals.totalOrders += shift.sales.totalOrders || 0;
        shiftWiseTotals.totalSales += shift.sales.totalSales || 0;
        shiftWiseTotals.totalPayments.cash += shift.sales.payments?.cash || 0;
        shiftWiseTotals.totalPayments.card += shift.sales.payments?.card || 0;
        shiftWiseTotals.totalPayments.online += shift.sales.payments?.online || 0;
        
        shiftWiseTotals.shifts.push({
          shiftId: (shift._id as any).toString(),
          shiftNumber: shift.shiftNumber,
          startTime: shift.startTime,
          endTime: now, // Use current time as end time for day-closed shifts
          sales: shift.sales
        });
      }

      await shift.save();
      
      // Get user details for createdBy and closedBy
      const createdByDetails = await populateUserDetails(shift.createdBy);
      const closedByDetails = await populateUserDetails(userId);
      
      updatedShifts.push(serializeShift(shift, createdByDetails, closedByDetails));
    }

    // Save day sales data to DaySales schema
    try {
      const daySalesRecord = new DaySales({
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
        denomination: createDenominationData(payload.denomination || payload.denominations)
      });

      await daySalesRecord.save();
    } catch (error) {
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
          totalOrders: daySalesData?.totalOrders || 0,
          totalSales: daySalesData?.totalSales || 0,
          description: "All orders for the entire day"
        },
        shiftWise: {
          totalOrders: shiftWiseTotals.totalOrders,
          totalSales: shiftWiseTotals.totalSales,
          description: "Orders from closed shifts only"
        }
      }
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      statusCode: 400,
      message: error?.message || 'Failed to perform day close' 
    });
  }
};

/**
 * Gets the current open shift
 * @param req - Express request object
 * @param res - Express response object
 */
export const getOpenShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const reqUser = req as userInterface;
    const branchId = reqUser.branchId;
    const filter: any = { status: 'open' };
    
    if (branchId) filter.branchId = branchId;
    
    const shift = await Shift.findOne(filter);
    
    if (shift) {
      // Get user details for createdBy
      const createdByDetails = await populateUserDetails(shift.createdBy);
      
      res.status(200).json({ 
        success: true,
        statusCode: 200,
        message: 'Open shift retrieved successfully',
        data: serializeShift(shift, createdByDetails) 
      });
    } else {
      res.status(200).json({ 
        success: true,
        statusCode: 200,
        message: 'No open shift found',
        data: null 
      });
    }
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      statusCode: 400,
      message: error?.message || 'Failed to fetch open shift' 
    });
  }
};

/**
 * Gets all shifts with pagination and filtering
 * @param req - Express request object
 * @param res - Express response object
 */
export const getShifts = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = shiftQueryValidation.parse(req.query || {});
    const reqUser = req as userInterface;
    const branchId = reqUser.branchId;

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (branchId) filter.branchId = branchId;
    if (query.date) filter.startDate = query.date;
    if (query.status) filter.status = query.status;
    if (query.shiftNumber) filter.shiftNumber = parseInt(query.shiftNumber, 10);

    const [items, total] = await Promise.all([
      Shift.find(filter).sort({ startTime: -1 }).skip(skip).limit(limit).lean(),
      Shift.countDocuments(filter),
    ]);

    // Get user details for all shifts
    const serializedItems = await Promise.all(
      items.map(async (shift) => {
        const createdByDetails = await populateUserDetails(shift.createdBy);
        const closedByDetails = await populateUserDetails(shift.closedBy);
        return serializeShift(shift, createdByDetails, closedByDetails);
      })
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Shifts retrieved successfully',
      data: serializedItems,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      statusCode: 400,
      message: error?.message || 'Failed to fetch shifts' 
    });
  }
};

/**
 * Gets a specific shift by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getShiftById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const shift = await Shift.findById(id);
    
    if (!shift) {
      res.status(404).json({ 
        success: false,
        statusCode: 404,
        message: 'Shift not found' 
      });
      return;
    }

    // Get user details for createdBy and closedBy
    const createdByDetails = await populateUserDetails(shift.createdBy);
    const closedByDetails = await populateUserDetails(shift.closedBy);

    res.status(200).json({ 
      success: true,
      statusCode: 200,
      message: 'Shift retrieved successfully',
      data: serializeShift(shift, createdByDetails, closedByDetails) 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      statusCode: 400,
      message: error?.message || 'Failed to fetch shift' 
    });
  }
};

