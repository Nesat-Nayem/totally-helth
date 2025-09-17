import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  logo?: string;
  status: 'active' | 'inactive';
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    logo: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
