import { Document } from 'mongoose';

export interface ITestimonial extends Document {
  quote: string;
  authorName: string;
  authorProfession: string;
  order: number; // For sorting testimonials
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

