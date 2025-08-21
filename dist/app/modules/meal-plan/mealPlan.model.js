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
exports.MealPlan = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const WeekOfferSchema = new mongoose_1.Schema({
    week: { type: String, required: true, trim: true },
    offer: { type: String, required: true, trim: true },
}, { _id: false });
const MealPlanSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    badge: { type: String, trim: true },
    discount: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    delPrice: { type: Number, min: 0 },
    category: { type: String, trim: true },
    brand: { type: String, trim: true },
    kcalList: [{ type: String, trim: true }],
    deliveredList: [{ type: String, trim: true }],
    suitableList: [{ type: String, trim: true }],
    daysPerWeek: [{ type: String, trim: true }],
    weeksOffers: [WeekOfferSchema],
    images: [{ type: String, trim: true }],
    thumbnail: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
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
        },
    },
});
MealPlanSchema.index({ title: 'text' });
MealPlanSchema.index({ status: 1, brand: 1, category: 1 });
exports.MealPlan = mongoose_1.default.model('MealPlan', MealPlanSchema);
