import { Document, Types } from 'mongoose';

export interface IWeekOffer {
  week: string;
  offer: string;
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
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
