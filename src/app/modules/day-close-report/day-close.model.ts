/**
 * Day Close Model
 * 
 * Mongoose model for day close operations and tracking.
 * Handles day close lifecycle and provides data for reporting.
 * 
 * @author API Team
 * @version 1.0.0
 */

import mongoose, { Schema } from 'mongoose';
import { IDayCloseReport } from './day-close-report.interface';

/**
 * Day Close schema
 * Tracks day close operations and status
 */
const DayCloseSchema = new Schema<IDayCloseReport>(
  {
    startDate: { 
      type: String, 
      required: true, 
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: 'Start date must be in YYYY-MM-DD format'
      }
    },
    startTime: { 
      type: Date, 
      required: true 
    },
    endDate: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: 'End date must be in YYYY-MM-DD format'
      }
    },
    endTime: { 
      type: Date 
    },
    status: { 
      type: String, 
      enum: ['day-close'], 
      default: 'day-close' 
    },
    branchId: { 
      type: String, 
      trim: true,
      index: true
    },
    createdBy: { 
      type: String, 
      trim: true 
    },
    closedBy: { 
      type: String, 
      trim: true 
    },
    note: { 
      type: String, 
      trim: true,
      maxlength: 500
    },
  },
  { 
    timestamps: true,
    collection: 'daycloses'
  }
);

// Database indexes for optimal query performance
DayCloseSchema.index({ startTime: 1, branchId: 1 });
DayCloseSchema.index({ status: 1, branchId: 1 });
DayCloseSchema.index({ startDate: 1, branchId: 1 });
DayCloseSchema.index({ endDate: 1, branchId: 1 });

// Compound index for efficient day close queries
DayCloseSchema.index({ startDate: 1, status: 1, branchId: 1 });

/**
 * Day Close Model
 * Handles day close operations and tracking
 */
export const DayClose = mongoose.model<IDayCloseReport>('DayClose', DayCloseSchema);

export default DayClose;
