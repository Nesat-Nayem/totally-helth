import { Document } from 'mongoose';

export interface ISubscription extends Document {
  fullName: string;
  email: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

