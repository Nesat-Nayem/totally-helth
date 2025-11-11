import mongoose, { Schema } from 'mongoose';
import { IWhyChoose } from './whyChoose.interface';

const WhyChooseCardSchema = new Schema(
  {
    icon: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    items: { type: [String], required: true, validate: {
      validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
      message: 'Items array must contain at least one item',
    }},
  },
  { _id: false }
);

const WhyChooseSchema: Schema = new Schema(
  {
    // Basic Details
    title: { type: String, required: true, trim: true },
    subTitle: { type: String, required: true, trim: true },

    // Cards
    card1: { type: WhyChooseCardSchema, required: true },
    card2: { type: WhyChooseCardSchema, required: true },
    card3: { type: WhyChooseCardSchema, required: true },

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

export const WhyChoose = mongoose.model<IWhyChoose>('WhyChoose', WhyChooseSchema);

