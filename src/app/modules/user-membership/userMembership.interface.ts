import { Document, Types } from 'mongoose';

export interface IMealItem {
  productId?: string;
  title: string;
  qty: number;
  punchingTime: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'general';
  moreOptions: Array<{
    name: string;
  }>;
  branchId?: string;
  createdBy?: string;
}

// Week meal plan interfaces (same as meal plan)
export type MealTypeMeals = {
  breakfast?: string[]; // up to 3 items
  lunch?: string[]; // up to 3 items
  snacks?: string[]; // up to 3 items
  dinner?: string[]; // up to 3 items
};

export type DayOfWeek =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

export interface IWeekDayPlan {
  day: DayOfWeek; // specific day override
  meals: MealTypeMeals; // same 3-items-per-type rule
}

export interface IWeekMealPlan {
  week: number; // 1-based week index
  // Exactly 7 days (Saturday to Friday) defining meals per day
  days: IWeekDayPlan[];
  // If provided, reuse meals from the referenced week number instead of days
  repeatFromWeek?: number;
}

export interface IUserMembership extends Document {
  userId: Types.ObjectId; // Reference to Customer
  mealPlanId: Types.ObjectId; // Reference to MealPlan
  totalMeals: number; // Total meals in the membership
  remainingMeals: number; // Meals left to consume
  consumedMeals: number; // Meals already consumed
  startDate: Date; // When the membership started
  endDate: Date; // When the membership expires
  status: 'active' | 'hold' | 'cancelled' | 'completed'; // Membership status
  totalPrice: number; // Total price of the membership
  receivedAmount: number; // Amount received from customer (always equals totalPrice)
  paymentMode?: 'cash' | 'card' | 'online' | 'payment_link'; // Payment method used
  paymentStatus: 'paid'; // Payment status
  note?: string; // Additional notes
  mealItems: IMealItem[]; // Array of consumed meal items
  history: Array<{
    action: 'created' | 'consumed' | 'updated' | 'completed';
    consumedMeals: number;
    remainingMeals: number;
    mealsChanged: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'general';
    timestamp: Date;
    notes?: string;
  }>;
  // Optional weeks field for structured meal plans
  weeks?: IWeekMealPlan[];
  createdAt: Date;
  updatedAt: Date;
}
