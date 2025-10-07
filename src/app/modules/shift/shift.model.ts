import mongoose, { Schema } from 'mongoose';
import { IShift, IShiftDenominations, IShiftSales } from './shift.interface';

/**
 * Default denominations factory function
 * @returns Object with all denomination fields set to 0
 */
const denominationsDefault = (): IShiftDenominations => ({
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
  totalCash: 0,
});

/**
 * Default sales tracking factory function
 * @returns Object with all sales fields set to 0
 */
const salesDefault = (): IShiftSales => ({
  totalOrders: 0,
  totalSales: 0,
  totalDiscount: 0,
  totalVat: 0,
  payments: {
    cash: 0,
    card: 0,
    online: 0,
  },
  salesByType: {
    restaurant: 0,
    online: 0,
    membership: 0,
  },
});

/**
 * Schema for cash denominations
 * Represents different currency denominations and their counts
 */
const DenominationsSchema = new Schema<IShiftDenominations>(
  {
    denomination1000: { type: Number, default: 0, min: 0 },
    denomination500: { type: Number, default: 0, min: 0 },
    denomination200: { type: Number, default: 0, min: 0 },
    denomination100: { type: Number, default: 0, min: 0 },
    denomination50: { type: Number, default: 0, min: 0 },
    denomination20: { type: Number, default: 0, min: 0 },
    denomination10: { type: Number, default: 0, min: 0 },
    denomination5: { type: Number, default: 0, min: 0 },
    denomination2: { type: Number, default: 0, min: 0 },
    denomination1: { type: Number, default: 0, min: 0 },
    totalCash: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/**
 * Schema for sales tracking
 * Simplified and optimized sales data for a shift
 */
const SalesSchema = new Schema<IShiftSales>(
  {
    totalOrders: { type: Number, default: 0, min: 0 },
    totalSales: { type: Number, default: 0, min: 0 },
    payments: {
      cash: { type: Number, default: 0, min: 0 },
      card: { type: Number, default: 0, min: 0 },
      online: { type: Number, default: 0, min: 0 },
    },
  },
  { _id: false }
);

/**
 * Main Shift schema
 * Represents a work shift with cash management functionality
 */
const ShiftSchema = new Schema<IShift>(
  {
    // Core shift identification
    shiftNumber: { 
      type: Number, 
      required: true, 
      min: 0  // Allow 0 for special day-close records when no shifts exist
    },
    status: { 
      type: String, 
      enum: ['open', 'closed', 'day-close'], 
      default: 'open' 
    },
    
    // Date and time tracking
    startDate: { 
      type: String, 
      required: true, 
      trim: true 
    },
    startTime: { 
      type: Date, 
      required: true 
    },
    endDate: { 
      type: String, 
      trim: true 
    },
    endTime: { 
      type: Date 
    },
    
    // User information
    loginName: { 
      type: String, 
      trim: true 
    },
    logoutTime: { 
      type: Date 
    },
    
    // System tracking
    branchId: { 
      type: String, 
      trim: true 
    },
    createdBy: { 
      type: String, 
      trim: true 
    },
    closedBy: { 
      type: String, 
      trim: true 
    },
    
    // Additional information
    note: { 
      type: String, 
      trim: true 
    },
    
    // Cash denominations tracking
    denominations: { 
      type: DenominationsSchema, 
      default: denominationsDefault 
    },
    
    // Sales tracking for this shift
    sales: { 
      type: SalesSchema, 
      default: salesDefault 
    },
  },
  { timestamps: true }
);

// Database indexes for optimal query performance
ShiftSchema.index({ startTime: 1, branchId: 1 });
ShiftSchema.index({ status: 1, branchId: 1 });
ShiftSchema.index({ shiftNumber: 1, branchId: 1 });
ShiftSchema.index({ startDate: 1, branchId: 1, shiftNumber: 1 });

/**
 * Shift model for database operations
 */
export const Shift = mongoose.model<IShift>('Shift', ShiftSchema);
