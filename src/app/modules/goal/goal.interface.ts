import { Document } from 'mongoose';

export interface IGoalSection {
  title: string;
  icon: string; // URL
  description: string;
}

export interface IGoal extends Document {
  title: string;
  subtitle: string;
  sections: IGoalSection[]; // length up to 3
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: 'active' | 'inactive';
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
