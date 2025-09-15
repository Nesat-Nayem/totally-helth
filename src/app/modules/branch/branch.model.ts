import mongoose, { Document, Schema } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  location?: string;
  brand?: string;
  logo?: string;
  status: 'active' | 'inactive';
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String },
    brand: { type: String },
    logo: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

branchSchema.index({ name: 1 }, { unique: true, sparse: true });

export const Branch = mongoose.model<IBranch>('Branch', branchSchema);
