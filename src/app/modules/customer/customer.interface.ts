import { Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
