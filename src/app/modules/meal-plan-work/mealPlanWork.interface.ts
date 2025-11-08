import { Document } from 'mongoose';

export interface IMealPlanWorkStep {
  title: string;
  subTitle: string;
}

export interface IMealPlanWork extends Document {
  // General Information
  title: string;
  subtitle: string;
  banner1: string; // URL
  banner2: string; // URL

  // Steps
  step1: IMealPlanWorkStep;
  step2: IMealPlanWorkStep;
  step3: IMealPlanWorkStep;

  // Meta Options
  metaTitle: string;
  metaTagKeyword: string;
  description: string;

  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

