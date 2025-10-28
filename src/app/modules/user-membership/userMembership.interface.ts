import { Document, Types } from 'mongoose';

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
  receivedAmount: number; // Amount received from customer (for frontend compatibility)
  cumulativePaid: number; // Total amount paid by customer (cumulative)
  payableAmount: number; // Remaining amount to be paid
  paymentMode?: 'cash' | 'card' | 'online' | 'payment_link'; // Payment method used
  paymentStatus: 'paid' | 'unpaid' | 'partial'; // Payment status
  note?: string; // Additional notes
  history: Array<{
    action: 'created' | 'consumed' | 'updated' | 'completed' | 'payment_updated';
    consumedMeals: number;
    remainingMeals: number;
    mealsChanged: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'general';
    timestamp: Date;
    notes?: string;
    // Payment tracking fields
    totalPrice?: number;
    receivedAmount?: number;
    cumulativePaid?: number;
    payableAmount?: number;
    paymentMode?: string;
    paymentStatus?: string;
    amountPaid?: number; // Amount paid in this specific transaction
    amountChanged?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
