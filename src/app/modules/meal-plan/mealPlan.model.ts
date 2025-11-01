import mongoose, { Schema } from 'mongoose';
import { IMealPlan } from './mealPlan.interface';

const WeekOfferSchema = new Schema(
  {
    week: { type: String, required: true, trim: true },
    offer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// New minimal nested schemas for structured weekly meals
const MealTypeSchema = new Schema(
  {
    breakfast: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length === 3;
        },
        message: 'breakfast must contain exactly 3 items',
      },
      required: true,
    },
    lunch: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length === 3;
        },
        message: 'lunch must contain exactly 3 items',
      },
      required: true,
    },
    snacks: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length === 3;
        },
        message: 'snacks must contain exactly 3 items',
      },
      required: true,
    },
    dinner: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length === 3;
        },
        message: 'dinner must contain exactly 3 items',
      },
      required: true,
    },
  },
  { _id: false }
);

const WeekDayPlanSchema = new Schema(
  {
    day: {
      type: String,
      enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      required: true,
      lowercase: true,
      trim: true,
    },
    meals: { type: MealTypeSchema, required: true },
  },
  { _id: false }
);

const WeekMealPlanSchema = new Schema(
  {
    week: { type: Number, min: 1, required: true },
    // Exactly 7 per-day plans (Saturday to Friday)
    days: { type: [WeekDayPlanSchema], required: true },
    // If provided, reuse meals from the referenced week number
    repeatFromWeek: { type: Number, min: 1 },
  },
  { _id: false }
);

const MealPlanSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
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
    totalMeals: { type: Number, min: 0 },
    durationDays: { type: Number, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
    // New minimal fields for structured meal plans
    weeks: [WeekMealPlanSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const r: any = ret as any;
        if (r.createdAt) {
          r.createdAt = new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
        if (r.updatedAt) {
          r.updatedAt = new Date(r.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
      },
    },
  }
);

MealPlanSchema.index({ title: 'text' });
MealPlanSchema.index({ status: 1, brand: 1, category: 1 });

export const MealPlan = mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);
