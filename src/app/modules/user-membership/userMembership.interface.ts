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

export interface IUserMembership extends Document {
  userId: Types.ObjectId; // Reference to Customer
  mealPlanId: Types.ObjectId; // Reference to MealPlan
  totalMeals: number; // Total meals in the membership
  remainingMeals: number; // Meals left to consume
  consumedMeals: number; // Meals already consumed
  startDate: Date; // When the membership started
  endDate: Date; // When the membership expires
  status: 'active' | 'expired' | 'cancelled' | 'completed'; // Membership status
  isActive: boolean; // Quick status check
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
  createdAt: Date;
  updatedAt: Date;
}
