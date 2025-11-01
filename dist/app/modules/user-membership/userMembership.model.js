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
exports.UserMembership = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Meal Item Schema for tracking consumed meals
const MealItemSchema = new mongoose_1.Schema({
    productId: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    punchingTime: { type: Date, required: true, default: Date.now },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'general'],
        default: 'general'
    },
    moreOptions: {
        type: [
            new mongoose_1.Schema({
                name: { type: String, required: true, trim: true },
            }, { _id: false }),
        ],
        default: [],
    },
    branchId: { type: String, trim: true },
    createdBy: { type: String, trim: true }, // Staff who processed the meal consumption
}, { _id: false });
const UserMembershipSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    mealPlanId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MealPlan',
        required: true
    },
    totalMeals: {
        type: Number,
        required: true,
        min: 0
    },
    remainingMeals: {
        type: Number,
        required: true,
        min: 0
    },
    consumedMeals: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'hold', 'cancelled', 'completed'],
        default: 'active'
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    receivedAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'card', 'online', 'payment_link'],
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['paid'],
        default: 'paid'
    },
    note: {
        type: String,
        default: ''
    },
    mealItems: {
        type: [MealItemSchema],
        default: []
    },
    history: [{
            action: {
                type: String,
                enum: ['created', 'consumed', 'updated', 'completed', 'payment_updated'],
                required: true
            },
            consumedMeals: { type: Number, default: 0 },
            remainingMeals: { type: Number, default: 0 },
            mealsChanged: { type: Number, default: 0 },
            mealType: {
                type: String,
                enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'general'],
                default: 'general'
            },
            timestamp: { type: Date, default: Date.now },
            notes: { type: String }
        }],
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            const r = ret;
            if (r.createdAt) {
                r.createdAt = new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            }
            if (r.updatedAt) {
                r.updatedAt = new Date(r.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            }
            if (r.startDate) {
                r.startDate = new Date(r.startDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            }
            if (r.endDate) {
                r.endDate = new Date(r.endDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            }
        },
    },
});
// Indexes for better query performance
UserMembershipSchema.index({ userId: 1, status: 1 });
UserMembershipSchema.index({ mealPlanId: 1 });
UserMembershipSchema.index({ endDate: 1 });
UserMembershipSchema.index({ status: 1 });
exports.UserMembership = mongoose_1.default.model('UserMembership', UserMembershipSchema);
