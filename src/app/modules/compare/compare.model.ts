import mongoose, { Schema } from 'mongoose';
import { ICompare } from './compare.interface';

const CompareItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    included: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const CompareSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    banner1: { type: String, required: true },
    banner2: { type: String, required: true },
    compareItems: {
      type: [CompareItemSchema],
      default: [],
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        const r: any = ret as any;
        if (r.createdAt) {
          r.createdAt = new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
        if (r.updatedAt) {
          r.updatedAt = new Date(r.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
      },
    },
  }
);

export const Compare = mongoose.model<ICompare>('Compare', CompareSchema);

