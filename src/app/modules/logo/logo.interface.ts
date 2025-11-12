import { Document } from 'mongoose';

export interface ILogo extends Document {
  image: string;
  status: 'active' | 'inactive';
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

