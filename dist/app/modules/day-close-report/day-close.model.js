"use strict";
/**
 * Day Close Model
 *
 * Mongoose model for day close operations and tracking.
 * Handles day close lifecycle and provides data for reporting.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayClose = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Day Close schema
 * Tracks day close operations and status
 */
const DayCloseSchema = new mongoose_1.Schema({
    startDate: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
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
            validator: function (v) {
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
}, {
    timestamps: true,
    collection: 'daycloses'
});
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
exports.DayClose = mongoose_1.default.model('DayClose', DayCloseSchema);
exports.default = exports.DayClose;
