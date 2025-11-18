import { Document } from 'mongoose';

export interface IContact extends Document {
  fullName: string;
  emailAddress: string;
  phoneNumber?: string;
  subject?: string;
  message: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

