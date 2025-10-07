/**
 * Day Close Report Interfaces
 * 
 * Defines TypeScript interfaces for day close report operations.
 * Provides type safety and clear data structure definitions.
 * 
 * @author API Team
 * @version 1.0.0
 */

import { Document } from 'mongoose';

/**
 * Status types for day close reports
 */
export type DayCloseReportStatus = 'day-close' | 'closed';

/**
 * Interface for denomination data
 * Stores physical cash count for reconciliation
 */
export interface IDenomination {
  /** 1000 AED notes */
  denomination1000: number;
  /** 500 AED notes */
  denomination500: number;
  /** 200 AED notes */
  denomination200: number;
  /** 100 AED notes */
  denomination100: number;
  /** 50 AED notes */
  denomination50: number;
  /** 20 AED notes */
  denomination20: number;
  /** 10 AED notes */
  denomination10: number;
  /** 5 AED notes */
  denomination5: number;
  /** 2 AED notes */
  denomination2: number;
  /** 1 AED notes */
  denomination1: number;
  /** Total cash amount calculated from denominations */
  totalCash: number;
}

/**
 * Interface for sales data tracking
 * Simplified and optimized sales data for day/shift tracking
 */
export interface ISalesData {
  /** Total number of orders */
  totalOrders: number;
  /** Total sales amount (revenue) */
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
}

/**
 * Interface for individual shift sales summary
 */
export interface IShiftSalesSummary {
  /** Shift ID */
  shiftId: string;
  /** Shift number */
  shiftNumber: number;
  /** Shift start time */
  startTime: Date;
  /** Shift end time */
  endTime: Date;
  /** Sales data for this shift */
  sales: ISalesData;
}

/**
 * Interface for day sales data storage
 * Stores both day-wise and shift-wise sales data permanently
 * Now includes day-close functionality for no-shift scenarios
 */
export interface IDaySales extends Document {
  /** Date of the sales data (YYYY-MM-DD format) */
  date: string;
  /** Branch identifier */
  branchId?: string;
  /** Day-wise sales data (all orders for the entire day) */
  daySales: ISalesData;
  /** Shift-wise sales data (only orders from shifts) */
  shiftWiseSales: ISalesData;
  /** Individual shift summaries */
  shifts: IShiftSalesSummary[];
  /** Total number of shifts */
  totalShifts: number;
  /** Day close time */
  dayCloseTime: Date;
  /** User who closed the day */
  closedBy?: string;
  /** Physical cash denomination count for reconciliation */
  denomination?: IDenomination;
  
  // Day-close functionality fields (for no-shift scenarios)
  /** Day close start time */
  startTime?: Date;
  /** Day close end time */
  endTime?: Date;
  /** Day close status */
  status?: 'open' | 'closed';
  /** User who created the day close */
  createdBy?: string;
  /** Note for day close */
  note?: string;
  
  /** Document creation timestamp */
  createdAt: Date;
  /** Document last update timestamp */
  updatedAt: Date;
}

/**
 * Main day close report document interface
 */
export interface IDayCloseReport extends Document {
  startDate: string;
  startTime: Date;
  endDate?: string;
  endTime?: Date;
  status: DayCloseReportStatus;
  branchId?: string;
  createdBy?: string;
  closedBy?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Query parameters interface for filtering reports
 */
export interface IDayCloseReportQuery {
  page?: number;
  limit?: number;
  date?: string;
  status?: DayCloseReportStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * API response interface for paginated reports
 */
export interface IDayCloseReportResponse {
  data: IDayCloseReport[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Download request interface for export operations
 */
export interface IDownloadRequest {
  date?: string;
  format: 'pdf' | 'excel' | 'csv';
  reportIds?: string[];
  startDate?: string;
  endDate?: string;
  selectedDays?: string[];
  includeShiftWise?: boolean;
  includeDayWise?: boolean;
  includeThermalReceipt?: boolean;
}

/**
 * Report action interface for future operations
 */
export interface IReportAction {
  actionType: 'view' | 'edit' | 'delete' | 'reopen' | 'export';
  reportId: string;
  note?: string;
}
