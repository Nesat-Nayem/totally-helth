/**
 * Day Sales Model
 * 
 * Mongoose model for storing day-wise and shift-wise sales data permanently.
 * This avoids recalculation and improves performance for reporting APIs.
 * 
 * @author API Team
 * @version 1.0.0
 */

import mongoose, { Schema } from 'mongoose';
import { IDaySales, ISalesData, IShiftSalesSummary, IDenomination } from './day-close-report.interface';

/**
 * Default sales data structure
 */
const salesDataDefault = (): ISalesData => ({
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
 * Default denomination data structure
 */
const denominationDefault = (): IDenomination => ({
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
 * Sales data schema
 */
const SalesDataSchema = new Schema<ISalesData>(
  {
    totalOrders: { type: Number, default: 0, min: 0 },
    totalSales: { type: Number, default: 0, min: 0 },
    totalDiscount: { type: Number, default: 0, min: 0 },
    totalVat: { type: Number, default: 0, min: 0 },
    payments: {
      cash: { type: Number, default: 0, min: 0 },
      card: { type: Number, default: 0, min: 0 },
      online: { type: Number, default: 0, min: 0 },
    },
    salesByType: {
      restaurant: { type: Number, default: 0, min: 0 },
      online: { type: Number, default: 0, min: 0 },
      membership: { type: Number, default: 0, min: 0 },
    },
  },
  { _id: false }
);

/**
 * Denomination schema
 */
const DenominationSchema = new Schema<IDenomination>(
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
 * Shift sales summary schema
 */
const ShiftSalesSummarySchema = new Schema<IShiftSalesSummary>(
  {
    shiftId: { type: String, required: true },
    shiftNumber: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    sales: { type: SalesDataSchema, required: true },
  },
  { _id: false }
);

/**
 * Day Sales schema
 * Stores both day-wise and shift-wise sales data permanently
 */
const DaySalesSchema = new Schema<IDaySales>(
  {
    date: {
      type: String,
      required: true,
      index: true,
      validate: {
        validator: function(v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
        message: 'Date must be in YYYY-MM-DD format'
      }
    },
    branchId: {
      type: String,
      index: true
    },
    daySales: {
      type: SalesDataSchema,
      default: salesDataDefault,
      required: true
    },
    shiftWiseSales: {
      type: SalesDataSchema,
      default: salesDataDefault,
      required: true
    },
    shifts: [ShiftSalesSummarySchema],
    totalShifts: {
      type: Number,
      default: 0,
      min: 0
    },
    dayCloseTime: {
      type: Date,
      required: true
    },
    closedBy: {
      type: String
    },
    denomination: {
      type: DenominationSchema,
      default: denominationDefault
    }
  },
  {
    timestamps: true,
    collection: 'daysales'
  }
);

// Compound index for efficient queries
DaySalesSchema.index({ date: 1, branchId: 1 }, { unique: true });

// Ensure only one day sales record per date per branch
DaySalesSchema.index({ date: 1, branchId: 1 }, { unique: true });

/**
 * Day Sales Model
 * Stores day-wise and shift-wise sales data permanently
 */
export const DaySales = mongoose.model<IDaySales>('DaySales', DaySalesSchema);

export default DaySales;
