import { Document } from 'mongoose';


export interface IBanner extends Document {
  title: string;
  image: string;
  certLogo: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleReviewCount: number;
  status: 'active' | 'inactive';
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}




