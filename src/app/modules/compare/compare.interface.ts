import { Document } from 'mongoose';

export interface ICompareItem {
  title: string;
  included: boolean; // Yes/No
}

export interface ICompare extends Document {
  title: string;
  banner1: string; // Image URL
  banner2: string; // Image URL
  compareItems: ICompareItem[];
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

