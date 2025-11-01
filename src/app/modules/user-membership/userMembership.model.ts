import mongoose, { Schema } from 'mongoose';
import { IUserMembership, IMealItem, IWeekMealPlan, IWeekDayPlan, MealTypeMeals } from './userMembership.interface';

// Meal Item Schema for tracking consumed meals
const MealItemSchema = new Schema<IMealItem>(
  {
 
    title: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    punchingTime: { type: Date, required: true, default: Date.now },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
      
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

// Week meal plan schemas (same as meal plan)
const MealTypeSchema = new Schema<MealTypeMeals>(
  {
    breakfast: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: function (v: string[]) {
          return !v || (Array.isArray(v) && v.length <= 3);
        },
        message: 'breakfast can have maximum 3 items',
      },
    },
    lunch: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: function (v: string[]) {
          return !v || (Array.isArray(v) && v.length <= 3);
        },
        message: 'lunch can have maximum 3 items',
      },
    },
    snacks: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: function (v: string[]) {
          return !v || (Array.isArray(v) && v.length <= 3);
        },
        message: 'snacks can have maximum 3 items',
      },
    },
    dinner: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: function (v: string[]) {
          return !v || (Array.isArray(v) && v.length <= 3);
        },
        message: 'dinner can have maximum 3 items',
      },
    },
  },
  { _id: false }
);

// Schema for tracking consumed meals per day
const ConsumedMealsSchema = new Schema(
  {
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false },
    snacks: { type: Boolean, default: false },
  },
  { _id: false }
);

const WeekDayPlanSchema = new Schema<IWeekDayPlan>(
  {
    day: {
      type: String,
      enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      required: true,
      lowercase: true,
      trim: true,
    },
    meals: { type: MealTypeSchema, required: true },
    consumedMeals: { type: ConsumedMealsSchema, required: false },
    isConsumed: { type: Boolean, default: false }, // Simple flag in model
  },
  { _id: false }
);

const WeekMealPlanSchema = new Schema<IWeekMealPlan>(
  {
    week: { type: Number, min: 1, required: true },
    // Exactly 7 per-day plans (Saturday to Friday)
    days: { type: [WeekDayPlanSchema], required: true },
    // If provided, reuse meals from the referenced week number
    repeatFromWeek: { type: Number, min: 1 },
    isConsumed: { type: Boolean, default: false }, // Simple flag in model
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
    history: [{
      action: {
        type: String,
        enum: ['created', 'consumed', 'updated', 'completed', 'payment_updated'],
        required: true
      },
      consumedMeals: { type: Number, default: 0 }, // Total consumed meals after this action
      remainingMeals: { type: Number, default: 0 }, // Remaining meals after this action
      currentConsumed: { type: Number, default: 0 }, // Meals consumed in THIS punch/action
      timestamp: { type: Date, default: Date.now },
      notes: { type: String }, // Notes for this history entry
      mealItems: { type: [MealItemSchema], default: [] }, // Store meal items for each history entry
      // Week/day tracking for punch API
      week: { type: Number, min: 1 },
      day: {
        type: String,
        enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        lowercase: true,
        trim: true,
      },
      consumedMealTypes: [{
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
      }],
      // Track meal changes for update action
      mealChanges: [{
        mealType: {
          type: String,
          enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
        },
        before: [{ type: String }], // Items before update
        after: [{ type: String }], // Items after update
      }],
    }],
    // Optional weeks field for structured meal plans
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
UserMembershipSchema.index({ status: 1 });

export const UserMembership = (mongoose.models.UserMembership as mongoose.Model<IUserMembership>) || mongoose.model<IUserMembership>('UserMembership', UserMembershipSchema);
