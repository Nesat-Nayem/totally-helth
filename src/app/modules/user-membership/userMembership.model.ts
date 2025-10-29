import mongoose, { Schema } from 'mongoose';
import { IUserMembership, IMealItem } from './userMembership.interface';

// Meal Item Schema for tracking consumed meals
const MealItemSchema = new Schema<IMealItem>(
  {
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
        new Schema(
          {
            name: { type: String, required: true, trim: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    branchId: { type: String, trim: true },
    createdBy: { type: String, trim: true }, // Staff who processed the meal consumption
  },
  { _id: false }
);

const UserMembershipSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Customer', 
      required: true 
    },
    mealPlanId: { 
      type: Schema.Types.ObjectId, 
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
      enum: ['active', 'expired', 'cancelled', 'completed'], 
      default: 'active' 
    },
    isActive: { 
      type: Boolean, 
      default: true 
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
      notes: { type: String },
      mealItems: { type: [MealItemSchema], default: [] } // Store meal items for each history entry
    }],
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
        if (r.startDate) {
          r.startDate = new Date(r.startDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
        if (r.endDate) {
          r.endDate = new Date(r.endDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
      },
    },
  }
);

// Indexes for better query performance
UserMembershipSchema.index({ userId: 1, status: 1 });
UserMembershipSchema.index({ mealPlanId: 1 });
UserMembershipSchema.index({ endDate: 1 });
UserMembershipSchema.index({ status: 1, isActive: 1 });

export const UserMembership = mongoose.model<IUserMembership>('UserMembership', UserMembershipSchema);
