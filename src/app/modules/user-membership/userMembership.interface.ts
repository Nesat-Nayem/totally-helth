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
  consumedMeals?: {
    // Track which meal types were consumed for this day
    breakfast?: boolean;
    lunch?: boolean;
    dinner?: boolean;
    snacks?: boolean;
  };
  isConsumed?: boolean; // Simple flag: true if all 4 meals consumed, false by default
}

export interface IWeekMealPlan {
  week: number; // 1-based week index
  // Exactly 7 days (Saturday to Friday) defining meals per day
  days: IWeekDayPlan[];
  // If provided, reuse meals from the referenced week number instead of days
  repeatFromWeek?: number;
  isConsumed?: boolean; // Simple flag: true if all days in week consumed, false by default
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
  history: Array<{
    action: 'created' | 'consumed' | 'updated' | 'completed';
    consumedMeals: number; // Total consumed meals after this action
    remainingMeals: number; // Remaining meals after this action
    currentConsumed: number; // Meals consumed in THIS punch/action
    timestamp: Date;
    notes?: string; // Notes for this history entry
    // Week/day tracking for punch API
    week?: number;
    day?: DayOfWeek;
    consumedMealTypes?: ('breakfast' | 'lunch' | 'dinner' | 'snacks')[];
    mealItems?: IMealItem[]; // Meal items for this specific history entry
    // Track meal changes for update action
    mealChanges?: Array<{
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
      before: string[]; // Items before update
      after: string[]; // Items after update
    }>;
  }>;
  // Optional weeks field for structured meal plans
  weeks?: IWeekMealPlan[];
  createdAt: Date;
  updatedAt: Date;
}
