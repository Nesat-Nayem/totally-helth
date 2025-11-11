import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  status: 'active' | 'inactive';
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);

