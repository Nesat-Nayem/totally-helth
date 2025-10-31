import { Document, Types } from 'mongoose';

export interface IWeekOffer {
  week: string;
  offer: string;
}

export type MealTypeMeals = {
  breakfast: string[]; // exactly 3 items
  lunch: string[]; // exactly 3 items
  snacks: string[]; // exactly 3 items
  dinner: string[]; // exactly 3 items
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

export interface IMealPlan extends Document {
  title: string;
  description: string;
  badge?: string;
  discount?: string; // can be percent text like "10%"
  price: number;
  delPrice?: number;
  category?: string; // Breakfast/Lunch/Dinner/Snacks
  brand?: string; // Totally Health/Subway/etc
  kcalList?: string[];
  deliveredList?: string[];
  suitableList?: string[];
  daysPerWeek?: string[];
  weeksOffers?: IWeekOffer[];
  images?: string[]; // Cloudinary URLs
  thumbnail?: string; // main image
  totalMeals?: number; // Total number of meals in the plan
  durationDays?: number; // Duration of the plan in days
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  // New minimal fields for structured meal plans
  weeks?: IWeekMealPlan[];
}
