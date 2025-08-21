import mongoose, { Schema } from 'mongoose';
import { IMealPlan } from './mealPlan.interface';

const WeekOfferSchema = new Schema(
  {
    week: { type: String, required: true, trim: true },
    offer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const MealPlanSchema: Schema = new Schema(
  {
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
