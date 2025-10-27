import mongoose, { Schema } from 'mongoose';
import { IUserMembership } from './userMembership.interface';

const UserMembershipSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
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
    history: [{
      action: {
        type: String,
        enum: ['created', 'consumed', 'updated', 'completed'],
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
