import { Document } from 'mongoose';

/**
 * Possible status values for a shift
 */
export type ShiftStatus = 'open' | 'closed' | 'day-close';

/**
 * Interface for cash denominations tracking
 * Represents different currency denominations and their counts
 */
export interface IShiftDenominations {
  /** Number of 1000 denomination notes */
  denomination1000: number;
  /** Number of 500 denomination notes */
  denomination500: number;
  /** Number of 200 denomination notes */
  denomination200: number;
  /** Number of 100 denomination notes */
  denomination100: number;
  /** Number of 50 denomination notes */
  denomination50: number;
  /** Number of 20 denomination notes */
  denomination20: number;
  /** Number of 10 denomination notes */
  denomination10: number;
  /** Number of 5 denomination notes */
  denomination5: number;
  /** Number of 2 denomination notes */
  denomination2: number;
  /** Number of 1 denomination notes */
  denomination1: number;
  /** Total cash value calculated from denominations */
  totalCash: number;
}

/**
 * Interface for shift sales tracking
 * Simplified and optimized sales data for a shift
 */
export interface IShiftSales {
  /** Total number of orders in this shift */
  totalOrders: number;
  /** Total sales amount (revenue) from all orders in this shift */
  totalSales: number;
  /** Total discount amount */
  totalDiscount: number;
  /** Total VAT amount */
  totalVat: number;
  /** Payment breakdown by method */
  payments: {
    cash: number;
    card: number;
    online: number;
  };
  /** Sales breakdown by type */
  salesByType: {
    restaurant: number;
    online: number;
    membership: number;
  };
  /** Membership breakdown by order type */
  membershipBreakdown: {
    membershipMeal: number;
    membershipRegister: number;
  };
}

/**
 * Main Shift interface
 * Represents a work shift with cash management functionality
 */
export interface IShift extends Document {
  /** Unique shift number for the day */
  shiftNumber: number;
  /** Current status of the shift */
  status: ShiftStatus;
  
  /** Date when shift started (YYYY-MM-DD format) */
  startDate: string;
  /** Time when shift started */
  startTime: Date;
  /** Date when shift ended (YYYY-MM-DD format) */
  endDate?: string;
  /** Time when shift ended */
  endTime?: Date;
  
  /** Name of the person who started the shift */
  loginName?: string;
  /** Time when user logged out */
  logoutTime?: Date;
  
  /** Branch identifier */
  branchId?: string;
  /** User who created the shift */
  createdBy?: string;
  /** User who closed the shift */
  closedBy?: string;
  
  /** Additional notes for the shift */
  note?: string;
  
  /** Cash denominations tracking */
  denominations?: IShiftDenominations;
  
  /** Sales tracking for this shift */
  sales?: IShiftSales;
  
  /** Document creation timestamp */
  createdAt: Date;
  /** Document last update timestamp */
  updatedAt: Date;
}
