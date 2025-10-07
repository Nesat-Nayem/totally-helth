import mongoose, { Document, Schema } from 'mongoose';

export interface IMoreOption extends Document {
  name: string;
  category: 'more' | 'less' | 'without' | 'general';
  status: 'active' | 'inactive';
}

const moreOptionSchema = new Schema<IMoreOption>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['more', 'less', 'without', 'general'], default: 'general' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const MoreOption = mongoose.model<IMoreOption>('MoreOption', moreOptionSchema);
