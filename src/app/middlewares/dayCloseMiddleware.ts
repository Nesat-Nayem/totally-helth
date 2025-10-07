import { Request, Response, NextFunction } from 'express';
import { Shift } from '../modules/shift/shift.model';
import { DayClose } from '../modules/day-close-report/day-close.model';
import { userInterface } from './userInterface';

/**
 * Middleware to check if day is closed and move orders to next day
 */
export const dayCloseMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🚀 Day close middleware started');
    const reqUser = req as userInterface;
    const branchId = reqUser.branchId;
    
    console.log(`📍 Branch ID: ${branchId}`);
    console.log(`📅 Request body date: ${req.body?.date}`);
    
    // Get order date from request - check multiple possible fields
    let orderDate = req.body?.date || req.body?.startDate || req.body?.endDate;
    
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
    const isDayClosed = await checkIfDayClosed(orderDate, branchId);
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
    } else {
      console.log(`✅ Day ${orderDate} is open for orders`);
    }

    console.log('✅ Day close middleware completed');
    next();
  } catch (error) {
    console.error('❌ Day close middleware error:', error);
    next(); // Continue even if middleware fails
  }
};

/**
 * Check if a day is closed
 */
async function checkIfDayClosed(date: string, branchId?: string): Promise<boolean> {
  try {
    console.log(`🔍 Checking if day ${date} is closed for branch: ${branchId || 'default'}`);
    
    // Check Shift records with day-close status
    const dayClosedShift = await Shift.findOne({ 
      status: 'day-close', 
      startDate: date,
      ...(branchId ? { branchId } : {}) 
    });

    // Check DayClose records
    const dayCloseRecord = await DayClose.findOne({
      status: 'day-close',
      startDate: date,
      ...(branchId ? { branchId } : {})
    });

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
  } catch (error) {
    console.error('❌ Error checking day close:', error);
    return false;
  }
}

/**
 * Get next day from given date
 */
function getNextDay(date: string): string {
  const currentDate = new Date(date + 'T00:00:00.000Z');
  currentDate.setDate(currentDate.getDate() + 1);
  
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}