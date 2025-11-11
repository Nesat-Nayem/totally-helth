import { Document } from 'mongoose';

export interface IIncluded extends Document {
  meal_type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
  title: string;
  image_url: string;
  nutrition: {
    calories: number;
    fat_g: number;
    carbs_g: number;
    protein_g: number;
  };
  allergens: string[];
  status: 'active' | 'inactive';
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

