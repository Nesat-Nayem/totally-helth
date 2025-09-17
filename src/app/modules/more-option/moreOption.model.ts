import mongoose, { Document, Schema } from 'mongoose';

export interface IMoreOption extends Document {
  name: string;
  price: number;
  status: 'active' | 'inactive';
}

const moreOptionSchema = new Schema<IMoreOption>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const MoreOption = mongoose.model<IMoreOption>('MoreOption', moreOptionSchema);
