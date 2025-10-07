"use strict";
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
exports.Shift = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Default denominations factory function
 * @returns Object with all denomination fields set to 0
 */
const denominationsDefault = () => ({
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
const salesDefault = () => ({
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
const DenominationsSchema = new mongoose_1.Schema({
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
}, { _id: false });
/**
 * Schema for sales tracking
 * Simplified and optimized sales data for a shift
 */
const SalesSchema = new mongoose_1.Schema({
    totalOrders: { type: Number, default: 0, min: 0 },
    totalSales: { type: Number, default: 0, min: 0 },
    payments: {
        cash: { type: Number, default: 0, min: 0 },
        card: { type: Number, default: 0, min: 0 },
        online: { type: Number, default: 0, min: 0 },
    },
}, { _id: false });
/**
 * Main Shift schema
 * Represents a work shift with cash management functionality
 */
const ShiftSchema = new mongoose_1.Schema({
    // Core shift identification
    shiftNumber: {
        type: Number,
        required: true,
        min: 0 // Allow 0 for special day-close records when no shifts exist
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
}, { timestamps: true });
// Database indexes for optimal query performance
ShiftSchema.index({ startTime: 1, branchId: 1 });
ShiftSchema.index({ status: 1, branchId: 1 });
ShiftSchema.index({ shiftNumber: 1, branchId: 1 });
ShiftSchema.index({ startDate: 1, branchId: 1, shiftNumber: 1 });
/**
 * Shift model for database operations
 */
exports.Shift = mongoose_1.default.model('Shift', ShiftSchema);
