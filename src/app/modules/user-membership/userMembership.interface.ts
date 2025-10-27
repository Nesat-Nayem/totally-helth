import { Document, Types } from 'mongoose';

export interface IUserMembership extends Document {
  userId: Types.ObjectId; // Reference to User
  mealPlanId: Types.ObjectId; // Reference to MealPlan
  totalMeals: number; // Total meals in the membership
  remainingMeals: number; // Meals left to consume
  consumedMeals: number; // Meals already consumed
  startDate: Date; // When the membership started
  endDate: Date; // When the membership expires
  status: 'active' | 'expired' | 'cancelled' | 'completed'; // Membership status
  isActive: boolean; // Quick status check
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
